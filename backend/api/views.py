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
from .models import Itinerary, VisaRule, Transaction, Destination
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
    queryset = Itinerary.objects.all().order_by('-created_at')
    serializer_class = ItinerarySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

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

        return Response({
            "itinerary": itinerary_data,
            "visa_info": visa_info
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
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000" # Match frontend
    client_class = OAuth2Client

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_sales = Transaction.objects.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0
        total_itineraries = Itinerary.objects.count()
        total_users = User.objects.count()
        total_visa_rules = VisaRule.objects.count()
        
        return Response({
            "total_sales": total_sales,
            "total_itineraries": total_itineraries,
            "total_users": total_users,
            "total_visa_rules": total_visa_rules
        })

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
