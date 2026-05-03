from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ItineraryViewSet, GenerateItineraryView, VisaRuleView, 
    AdminStatsView, AdminUserViewSet, AdminTransactionViewSet,
    CountryViewSet, DestinationViewSet, AttractionViewSet,
    AdminVisaRuleViewSet, CreateOrderView, VerifyPaymentView, ProfileView,
    MyItinerariesView, WishlistToggleView, MyWishlistView, DownloadItineraryPDFView
)

router = DefaultRouter()
router.register(r'itineraries', ItineraryViewSet, basename='itinerary')
router.register(r'destinations', CountryViewSet, basename='destinations')
router.register(r'sub-destinations', DestinationViewSet, basename='sub-destinations')
router.register(r'attractions', AttractionViewSet, basename='attractions')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/transactions', AdminTransactionViewSet, basename='admin-transactions')
router.register(r'admin/visa-rules', AdminVisaRuleViewSet, basename='admin-visa-rules')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('generate/', GenerateItineraryView.as_view(), name='generate-itinerary'),
    path('visa/', VisaRuleView.as_view(), name='visa-rule'),
    path('payments/checkout/', CreateOrderView.as_view(), name='checkout'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='verify'),
    path('my-trips/', MyItinerariesView.as_view(), name='my-trips'),
    path('wishlist/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('wishlist/', MyWishlistView.as_view(), name='my-wishlist'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('itineraries/<int:itinerary_id>/pdf/', DownloadItineraryPDFView.as_view(), name='download-pdf'),
]
