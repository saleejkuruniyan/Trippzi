from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from .services.ai_engine import AIEngine
from .models import Itinerary, VisaRule, Transaction, Country, Destination, Attraction, Wishlist, ItineraryDay, SiteSettings
from .utils import fetch_unsplash_images, download_image_to_content_file
from .storage import R2Storage
from django.conf import settings
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
import requests
import os
from .serializers import (
    ItinerarySerializer, VisaRuleSerializer, TransactionSerializer, 
    UserSerializer, CountrySerializer, DestinationSerializer, AttractionSerializer
)

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Country.objects.all()
        
        return Country.objects.all() # Show all countries in generate page
    
    serializer_class = CountrySerializer
    pagination_class = None # Disable pagination for countries
    lookup_field = 'slug'
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def destinations(self, request, slug=None):
        country = self.get_object()
        destinations = country.destinations.all()
        serializer = DestinationSerializer(destinations, many=True)
        return Response(serializer.data)

class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class AttractionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Attraction.objects.all()
    serializer_class = AttractionSerializer
    permission_classes = [AllowAny]

class ItineraryViewSet(viewsets.ModelViewSet):
    serializer_class = ItinerarySerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Itinerary.objects.all().order_by('-created_at')
        
        # Admin filtering
        is_custom = self.request.query_params.get('is_custom')
        if is_custom is not None:
            queryset = queryset.filter(is_custom=is_custom.lower() == 'true')

        if user.is_authenticated and user.is_staff:
            return queryset
            
        # For 'list' action (Homepage, Destinations), only show approved standard trips
        if self.action == 'list':
            return queryset.filter(is_custom=False, is_approved=True)
            
        # For 'retrieve' (direct link), we allow all - Serializer handles content masking
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def clone_to_standard(self, request, pk=None):
        itinerary = self.get_object()
        copy_pdf = request.data.get('copy_pdf', False)
        
        # Create a copy
        new_itinerary = Itinerary.objects.create(
            country=itinerary.country,
            title=f"Standard: {itinerary.title}",
            destination=itinerary.destination,
            duration_days=itinerary.duration_days,
            regular_price=itinerary.regular_price,
            sale_price=itinerary.sale_price,
            price=itinerary.price,
            description=itinerary.description,
            highlights=itinerary.highlights,
            content=itinerary.content,
            image=itinerary.image, 
            image_url=itinerary.image_url,
            is_premium=itinerary.is_premium,
            user=None,
            is_custom=False,
            is_approved=False
        )
        
        # Clone day details
        from .models import ItineraryDay
        for day in itinerary.day_details.all():
            ItineraryDay.objects.create(
                itinerary=new_itinerary,
                day_number=day.day_number,
                location_name=day.location_name,
                image=day.image,
                image_url=day.image_url,
                caption=day.caption
            )
            
        # Copy PDF if requested and exists
        if copy_pdf:
            from django.core.files.storage import default_storage
            from django.utils.text import slugify
            from django.core.files.base import ContentFile
            
            country_slug = slugify(itinerary.country.name if itinerary.country else 'generic')
            src_prefix = f"itinerary/{country_slug}/{itinerary.id}/"
            dest_prefix = f"itinerary/{country_slug}/{new_itinerary.id}/"
            
            try:
                # List all files in the source prefix
                directories, files = default_storage.listdir(src_prefix)
                for filename in files:
                    if filename.endswith('.pdf'):
                        # Read and copy
                        with default_storage.open(f"{src_prefix}{filename}") as f:
                            content = f.read()
                            default_storage.save(f"{dest_prefix}{filename}", ContentFile(content))
                print(f"Copied PDFs from {src_prefix} to {dest_prefix}")
            except Exception as e:
                print(f"Failed to copy PDFs: {str(e)}")

        return Response(ItinerarySerializer(new_itinerary, context={'request': request}).data, status=status.HTTP_201_CREATED)
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class GenerateItineraryView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        country_id = request.data.get('country_id')
        destination_ids = request.data.get('destination_ids', [])
        duration = request.data.get('duration', 5)
        budget = request.data.get('budget', 'Budget')
        style = request.data.get('style', 'Backpacking')
        interests = request.data.get('interests', 'Food, Culture')
        source_country = request.data.get('source_country', 'India')
        custom_destination = request.data.get('custom_destination', '')

        if not country_id:
            return Response({"error": "Country is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        country_obj = get_object_or_404(Country, id=country_id)
        destinations = Destination.objects.filter(id__in=destination_ids, country=country_obj)
        dest_names = [d.name for d in destinations]
        if custom_destination:
            dest_names.append(custom_destination)

        if not dest_names:
            return Response({"error": "At least one destination is required"}, status=status.HTTP_400_BAD_REQUEST)

        ai_engine = AIEngine()
        
        # 1. Generate Itinerary Structure
        itinerary_data = ai_engine.generate_itinerary(
            country=country_obj.name,
            selected_destinations=dest_names,
            duration=duration,
            budget=budget,
            style=style,
            interests=interests
        )
        
        if "error" in itinerary_data:
            return Response({
                "error": "AI Generation failed",
                "details": itinerary_data.get("error"),
                "raw": itinerary_data.get("raw")
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Get Visa Info
        visa_info = ai_engine.get_visa_info(source_country, country_obj.name)

        # 3. Save to DB
        content_data = itinerary_data.get('days', [])
        
        # Get dynamic pricing from settings
        site_settings = SiteSettings.get_settings()
        
        itinerary_obj = Itinerary.objects.create(
            user=request.user,
            country=country_obj,
            is_custom=True,
            title=itinerary_data.get('title', f"Trip to {country_obj.name}"),
            destination=", ".join(dest_names),
            duration_days=duration,
            price=site_settings.custom_itinerary_price,
            sale_price=site_settings.custom_itinerary_price,
            regular_price=site_settings.custom_itinerary_regular_price,
            description=itinerary_data.get('overview', ''),
            content=content_data
        )
        itinerary_obj.destinations.set(destinations)
        
        # 3b. Fetch Itinerary Hero Image
        hero_images = fetch_unsplash_images(f"{country_obj.name} travel {dest_names[0]}", count=1)
        if hero_images:
            itinerary_obj.image_url = hero_images[0]
            hero_file = download_image_to_content_file(hero_images[0])
            if hero_file:
                itinerary_obj.image.save(f"itinerary_{itinerary_obj.id}.jpg", hero_file)
            itinerary_obj.save()

        # 4. Fetch and save day-wise images + Enrichment
        for day in content_data:
            day_num = day.get('day_number')
            activities = day.get('activities', [])
            
            for idx, act in enumerate(activities):
                # Use AI provided unsplash query
                query = act.get('unsplash_query') or f"{act.get('activity')} {act.get('location')}"
                image_urls = fetch_unsplash_images(query, count=1)
                
                if image_urls:
                    img_url = image_urls[0]
                    act['image_url'] = img_url # Add to content JSON
                    
                    # Also save as ItineraryDay for backward compatibility or special uses
                    if idx == 0: # Save first activity of each day as the day's thumbnail
                        day_detail = ItineraryDay.objects.create(
                            itinerary=itinerary_obj,
                            day_number=day_num,
                            location_name=act.get('location', ''),
                            image_url=img_url,
                            caption=act.get('activity', '')
                        )
                        image_file = download_image_to_content_file(img_url)
                        if image_file:
                            day_detail.image.save(f"day_{day_num}_spot_{idx}.jpg", image_file)
        
        # Save updated content with image URLs
        itinerary_obj.content = content_data
        itinerary_obj.save()

        return Response({
            "itinerary": itinerary_data,
            "visa_info": visa_info,
            "itinerary_id": itinerary_obj.id,
            "is_owned": False # Initially not owned until payment, but they can see preview
        }, status=status.HTTP_200_OK)

class VisaRuleView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        source = request.query_params.get('source')
        dest = request.query_params.get('destination')
        
        rule = VisaRule.objects.filter(source_country=source, destination_country=dest).first()
        if rule:
            return Response(VisaRuleSerializer(rule).data)
        
        # Fallback to AI if no rule found in DB
        ai_engine = AIEngine()
        visa_info = ai_engine.get_visa_info(source, dest)
        return Response(visa_info)

class GoogleLogin(SocialLoginView):
    permission_classes = [AllowAny]
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000" # Match frontend
    client_class = OAuth2Client

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_sales = Transaction.objects.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0
        total_standard = Itinerary.objects.filter(is_custom=False).count()
        total_custom = Itinerary.objects.filter(is_custom=True).count()
        total_users = User.objects.count()
        total_visa_rules = VisaRule.objects.count()
        
        return Response({
            "total_sales": total_sales,
            "total_itineraries": total_standard + total_custom,
            "total_standard": total_standard,
            "total_custom": total_custom,
            "total_users": total_users,
            "total_visa_rules": total_visa_rules
        })

from .services.payment_service import PaymentService

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        itinerary_id = request.data.get('itinerary_id')
        if not itinerary_id:
            return Response({"error": "itinerary_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment_service = PaymentService()
            order_data = payment_service.create_order(request.user, itinerary_id)
            return Response(order_data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')
        
        payment_service = PaymentService()
        if payment_service.verify_payment(order_id, payment_id, signature):
            return Response({"status": "success"})
        return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        user = request.user
        data = request.data
        
        # Update User fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()
        
        # Update Profile fields
        profile = user.profile
        profile_data = data.get('profile', {})
        profile.phone_number = profile_data.get('phone_number', profile.phone_number)
        profile.address = profile_data.get('address', profile.address)
        profile.city = profile_data.get('city', profile.city)
        profile.country = profile_data.get('country', profile.country)
        profile.zip_code = profile_data.get('zip_code', profile.zip_code)
        profile.save()
        
        return Response(UserSerializer(user).data)

class MyItinerariesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 1. Custom itineraries owned by the user
        custom_trips = Itinerary.objects.filter(user=request.user)
        
        # 2. Curated itineraries purchased by the user
        purchased_ids = Transaction.objects.filter(
            user=request.user, 
            status='COMPLETED'
        ).values_list('itinerary_id', flat=True)
        purchased_trips = Itinerary.objects.filter(id__in=purchased_ids)
        
        # Combine and serialize
        all_trips = (custom_trips | purchased_trips).distinct().order_by('-created_at')
        
        # Check ownership for each (already serialized in ItinerarySerializer)
        serializer = ItinerarySerializer(all_trips, many=True, context={'request': request})
        return Response(serializer.data)

class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        itinerary_id = request.data.get('itinerary_id')
        if not itinerary_id:
            return Response({'error': 'itinerary_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            itinerary = Itinerary.objects.get(id=itinerary_id)
        except Itinerary.DoesNotExist:
            return Response({'error': 'Itinerary not found'}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, itinerary=itinerary)
        if not created:
            wishlist_item.delete()
            return Response({'wishlisted': False})
        return Response({'wishlisted': True})

class MyWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('itinerary')
        itineraries = [item.itinerary for item in items]
        serializer = ItinerarySerializer(itineraries, many=True, context={'request': request})
        return Response(serializer.data)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AdminVisaRuleViewSet(viewsets.ModelViewSet):
    queryset = VisaRule.objects.all().order_by('destination_country')
    serializer_class = VisaRuleSerializer
    permission_classes = [IsAdminUser]

class AdminTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminUser]

class DownloadItineraryPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, itinerary_id):
        # 1. Verify purchase or ownership
        itinerary = get_object_or_404(Itinerary, id=itinerary_id)
        is_purchased = Transaction.objects.filter(
            user=request.user, itinerary=itinerary, status='COMPLETED'
        ).exists()
        
        if not is_purchased:
            return Response({'error': 'Purchase required to download booklet.'}, status=403)

        # 2. Check if PDF already exists in R2
        storage = R2Storage()
        country_slug = itinerary.country.slug if itinerary.country else "global"
        
        # Check if we already have a generated PDF for this itinerary/user combination
        # We'll look into the specific directory for any .pdf file to reuse
        prefix = f"itinerary/{country_slug}/{itinerary_id}/"
        try:
            dirs, files = storage.listdir(prefix)
            pdf_files = [f for f in files if f.endswith('.pdf')]
            if pdf_files:
                pdf_url = storage.url(f"{prefix}{pdf_files[0]}")
                return Response({'pdf_url': pdf_url})
        except:
            pass

        # 3. Generate PDF fresh
        try:
            import uuid
            pdf_bytes = None
            
            # Attempt WeasyPrint first (better CSS support)
            try:
                from weasyprint import HTML
                day_images = ItineraryDay.objects.filter(itinerary=itinerary)
                context = {
                    'itinerary': itinerary,
                    'days': itinerary.content,
                    'day_images': day_images,
                    'user': request.user,
                }
                html_string = render_to_string('itinerary_pdf.html', context)
                pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
            except (ImportError, OSError, Exception) as e:
                # Fallback to xhtml2pdf or fpdf2
                print(f"WeasyPrint failed: {str(e)}")
                try:
                    # Try xhtml2pdf (HTML support)
                    from xhtml2pdf import pisa
                    from io import BytesIO
                    day_images = ItineraryDay.objects.filter(itinerary=itinerary)
                    context = {
                        'itinerary': itinerary,
                        'days': itinerary.content,
                        'day_images': day_images,
                        'user': request.user,
                    }
                    html_string = render_to_string('itinerary_pdf.html', context)
                    result = BytesIO()
                    pisa_status = pisa.CreatePDF(html_string, dest=result)
                    if pisa_status.err:
                        raise Exception("xhtml2pdf failed")
                    pdf_bytes = result.getvalue()
                except Exception as ex:
                        # FINAL FALLBACK: fpdf2 (Pure Python, no HTML, very robust)
                        print(f"xhtml2pdf failed: {str(ex)}. Using fpdf2 fallback.")
                        try:
                            from fpdf import FPDF
                            
                            class SafePDF(FPDF):
                                def safe_text(self, text):
                                    if not text: return ""
                                    # Convert to latin-1 and replace unknown chars with '?' to avoid UnicodeEncodeError
                                    return str(text).encode('latin-1', 'replace').decode('latin-1')

                            pdf = SafePDF()
                            pdf.add_page()
                            pdf.set_font("Helvetica", 'B', 16)
                            pdf.cell(0, 10, pdf.safe_text(f"Itinerary: {itinerary.title}"), ln=True)
                            pdf.ln(5)
                            
                            pdf.set_font("Helvetica", '', 12)
                            pdf.cell(0, 10, pdf.safe_text(f"Destination: {itinerary.destination}"), ln=True)
                            pdf.cell(0, 10, pdf.safe_text(f"Duration: {itinerary.duration_days} Days"), ln=True)
                            pdf.ln(5)
                            
                            pdf.set_font("Helvetica", 'I', 10)
                            pdf.multi_cell(0, 10, pdf.safe_text(itinerary.description))
                            pdf.ln(10)
                            
                            for day in (itinerary.content or []):
                                pdf.set_font("Helvetica", 'B', 14)
                                day_num = day.get('day', day.get('day_number', ''))
                                theme = day.get('theme', '')
                                pdf.cell(0, 10, pdf.safe_text(f"Day {day_num}: {theme}"), ln=True)
                                pdf.ln(2)
                                
                                pdf.set_font("Helvetica", '', 10)
                                for act in day.get('activities', []):
                                    time = act.get('time', '')
                                    activity = act.get('activity', '')
                                    desc = act.get('description', '')
                                    
                                    pdf.set_font("Helvetica", 'B', 10)
                                    pdf.cell(0, 8, pdf.safe_text(f"- {time}: {activity}"), ln=True)
                                    pdf.set_font("Helvetica", '', 10)
                                    pdf.multi_cell(0, 6, pdf.safe_text(desc))
                                    pdf.ln(2)
                                pdf.ln(5)
                            
                            pdf_bytes = pdf.output()
                        except Exception as final_ex:
                            instructions = "Please install GTK3 runtime for better PDFs: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases" if os.name == 'nt' else "Please run: brew install pango"
                            return Response({
                                'error': 'All PDF Engines failed to load.',
                                'details': f"WeasyPrint: {str(e)} | xhtml2pdf: {str(ex)} | fpdf2: {str(final_ex)}",
                                'instructions': instructions
                            }, status=500)

        except Exception as e:
            return Response({'error': f'PDF Generation failed: {str(e)}'}, status=500)

        # 4. Upload to R2 and return URL
        new_uuid = uuid.uuid4()
        r2_key = f"{prefix}{new_uuid}.pdf"
        storage.save(r2_key, ContentFile(pdf_bytes))
        pdf_url = storage.url(r2_key)
        
        return Response({'pdf_url': pdf_url})

from .serializers import SiteSettingsSerializer

class SiteSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        site_settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(site_settings)
        return Response(serializer.data)

    def patch(self, request):
        site_settings = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(site_settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
