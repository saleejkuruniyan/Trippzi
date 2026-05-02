from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ItineraryViewSet, GenerateItineraryView, VisaRuleView, 
    AdminStatsView, AdminUserViewSet, AdminTransactionViewSet,
    DestinationViewSet
)

router = DefaultRouter()
router.register(r'itineraries', ItineraryViewSet)
router.register(r'destinations', DestinationViewSet, basename='destinations')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/transactions', AdminTransactionViewSet, basename='admin-transactions')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('generate/', GenerateItineraryView.as_view(), name='generate-itinerary'),
    path('visa/', VisaRuleView.as_view(), name='visa-rule'),
]
