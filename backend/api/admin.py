from django.contrib import admin
from .models import Itinerary, VisaRule, Transaction, Destination, UserProfile, Wishlist

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'duration_days', 'price', 'is_premium', 'is_custom', 'is_approved', 'user', 'created_at')
    list_filter = ('is_premium', 'is_custom', 'is_approved', 'destination', 'created_at')
    search_fields = ('title', 'destination', 'description', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VisaRule)
class VisaRuleAdmin(admin.ModelAdmin):
    list_display = ('source_country', 'destination_country', 'visa_required', 'last_updated')
    list_filter = ('visa_required', 'source_country', 'destination_country')
    search_fields = ('source_country', 'destination_country')
    ordering = ('source_country', 'destination_country')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'itinerary', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'itinerary__title', 'razorpay_order_id', 'razorpay_payment_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'city', 'country', 'zip_code')
    search_fields = ('user__username', 'user__email', 'phone_number', 'city')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'itinerary', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'itinerary__title')
