from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from .services.ai_engine import AIEngine
from .models import Itinerary, VisaRule, Transaction, Destination, Wishlist, ItineraryDay
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
    UserSerializer, DestinationSerializer
)

class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        user = self.request.user
        # Staff see all destinations
        if user.is_authenticated and user.is_staff:
            return Destination.objects.all()
        
        # Regular users only see destinations with at least one approved itinerary
        return Destination.objects.annotate(
            approved_count=Count('itineraries', filter=Q(itineraries__is_approved=True))
        ).filter(approved_count__gt=0)
    
    serializer_class = DestinationSerializer
    lookup_field = 'slug'
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
        
        # Rule: 
        # 1. Standard (is_custom=False) must be approved.
        # 2. Custom (is_custom=True) must be owned by the user.
        query = Q(is_custom=False, is_approved=True)
        if user.is_authenticated:
            query |= Q(is_custom=True, user=user)
            
        return queryset.filter(query).distinct()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class GenerateItineraryView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        destination = request.data.get('destination')
        duration = request.data.get('duration', 5)
        budget = request.data.get('budget', 'Budget')
        style = request.data.get('style', 'Backpacking')
        interests = request.data.get('interests', 'Food, Culture')
        source_country = request.data.get('source_country', 'India')

        if not destination:
            return Response({"error": "Destination is required"}, status=status.HTTP_400_BAD_REQUEST)

        ai_engine = AIEngine()
        
        # 1. Generate Itinerary Structure
        itinerary_data = ai_engine.generate_itinerary(destination, duration, budget, style, interests)
        
        # 1b. Ensure Destination exists or create it
        dest_obj, created = Destination.objects.get_or_create(
            name__iexact=destination,
            defaults={
                'name': destination,
                'description': f"A beautiful journey to {destination}."
            }
        )
        
        if created:
            # Enrich new destination with AI guide and Unsplash image
            guide = ai_engine.generate_destination_guide(destination)
            dest_obj.description = guide.get('description', dest_obj.description)
            dest_obj.best_time = guide.get('best_time', '')
            dest_obj.visa_process = guide.get('visa_process', '')
            dest_obj.airports = guide.get('airports', [])
            dest_obj.tips = guide.get('tips', [])
            dest_obj.days_recommendation = guide.get('days_recommendation', {})
            
            # Fetch destination hero image
            dest_images = fetch_unsplash_images(f"{destination} travel", count=1)
            if dest_images:
                dest_obj.image_url = dest_images[0]
                dest_image_file = download_image_to_content_file(dest_images[0])
                if dest_image_file:
                    dest_obj.image.save(f"dest_{dest_obj.slug}.jpg", dest_image_file)
            
            dest_obj.save()

        # 2. Get Visa Info
        visa_info = ai_engine.get_visa_info(source_country, destination)

        # 3. Save to DB if authenticated
        itinerary_id = None
        is_owned = False
        if request.user.is_authenticated:
            # Store the full days structure as-is in content field
            content_data = itinerary_data.get('days', [])
            
            itinerary_obj = Itinerary.objects.create(
                user=request.user,
                destination_rel=dest_obj,
                is_custom=True,
                title=itinerary_data.get('title', f"Trip to {destination}"),
                destination=destination,
                duration_days=duration,
                price=99.00,
                sale_price=99.00,
                regular_price=199.00,
                description=itinerary_data.get('overview', ''),
                content=content_data
            )
            itinerary_id = itinerary_obj.id

            # 3b. Fetch Itinerary Hero Image (Thumbnail)
            hero_images = fetch_unsplash_images(f"{destination} {itinerary_obj.title}", count=1)
            if hero_images:
                itinerary_obj.image_url = hero_images[0]
                hero_file = download_image_to_content_file(hero_images[0])
                if hero_file:
                    itinerary_obj.image.save(f"itinerary_{itinerary_obj.id}.jpg", hero_file)
                itinerary_obj.save()

            # 4. Fetch and save day-wise images from Unsplash
            for day in content_data:
                day_num = day.get('day_number')
                theme = day.get('theme', '')
                query = f"{destination} {theme}"
                
                # Fetch up to 2 images per day
                image_urls = fetch_unsplash_images(query, count=2)
                
                for idx, img_url in enumerate(image_urls):
                    day_detail = ItineraryDay.objects.create(
                        itinerary=itinerary_obj,
                        day_number=day_num,
                        location_name=theme,
                        image_url=img_url,
                        caption=f"{theme} - {idx+1}"
                    )
                    # Download to local storage (R2/S3) for persistence
                    image_file = download_image_to_content_file(img_url)
                    if image_file:
                        day_detail.image.save(f"day_{day_num}_{idx}.jpg", image_file)

        return Response({
            "itinerary": itinerary_data,
            "visa_info": visa_info,
            "itinerary_id": itinerary_id,
            "is_owned": is_owned
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
        is_owner = itinerary.user == request.user and itinerary.is_custom
        
        if not (is_purchased or is_owner):
            return Response({'error': 'Purchase required to download booklet.'}, status=403)

        # 2. Check if PDF already exists in R2
        r2_key = f"pdfs/itinerary_{itinerary_id}_{request.user.id}.pdf"
        storage = R2Storage()
        
        if storage.exists(r2_key):
            pdf_url = storage.url(r2_key)
            return Response({'pdf_url': pdf_url})

        # 3. Generate PDF fresh
        try:
            from weasyprint import HTML
            # Try to build and write PDF to catch OS library errors
            try:
                day_images = ItineraryDay.objects.filter(itinerary=itinerary)
                context = {
                    'itinerary': itinerary,
                    'days': itinerary.content,
                    'day_images': day_images,
                    'user': request.user,
                }
                html_string = render_to_string('itinerary_pdf.html', context)
                pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
            except Exception as e:
                # Handle missing system libraries (Pango/Cairo/GTK+)
                err_msg = str(e).lower()
                if 'dlopen' in err_msg or 'cannot load library' in err_msg or 'pango' in err_msg or 'cairo' in err_msg:
                    instructions = "Please install GTK3 runtime: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases" if os.name == 'nt' else "Please run: brew install pango"
                    return Response({
                        'error': 'System dependencies missing (Pango/Cairo).',
                        'details': str(e),
                        'instructions': instructions
                    }, status=500)
                raise e

        except ImportError:
            return Response({'error': 'WeasyPrint not installed. Run: pip install weasyprint'}, status=500)

        # 4. Upload to R2 and return URL
        storage.save(r2_key, ContentFile(pdf_bytes))
        pdf_url = storage.url(r2_key)
        
        return Response({'pdf_url': pdf_url})
