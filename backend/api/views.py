from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from .services.ai_engine import AIEngine
from .models import Itinerary, VisaRule, Transaction, Destination, Wishlist
from .serializers import (
    ItinerarySerializer, VisaRuleSerializer, TransactionSerializer, 
    UserSerializer, DestinationSerializer
)

class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.all()
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
        
        from django.db.models import Q
        # Show ONLY itineraries that are explicitly approved OR owned by the user
        # (Already filtered by queryset above if is_custom was passed, but public users 
        # usually won't pass is_custom. If they do, we still apply approval logic)
        query = Q(is_approved=True)
        if user.is_authenticated:
            query |= Q(user=user)
            
        return queryset.filter(query).distinct()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class GenerateItineraryView(APIView):
    permission_classes = [AllowAny]
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
        
        # 1. Generate Itinerary
        itinerary_data = ai_engine.generate_itinerary(destination, duration, budget, style, interests)
        
        # 2. Get Visa Info
        visa_info = ai_engine.get_visa_info(source_country, destination)

        # 3. Save to DB if authenticated
        itinerary_id = None
        is_owned = False
        if request.user.is_authenticated:
            # Flatten day-wise structure to match Itinerary model content field
            content_data = []
            for day in itinerary_data.get('days', []):
                for act in day.get('activities', []):
                    content_data.append({
                        "day": day.get('day_number'),
                        "time": act.get('time'),
                        "activity": act.get('activity'),
                        "description": act.get('description')
                    })
            
            itinerary_obj = Itinerary.objects.create(
                user=request.user,
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
