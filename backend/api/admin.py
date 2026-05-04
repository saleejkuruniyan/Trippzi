from django.contrib import admin
from .models import Itinerary, Transaction, Country, Destination, Attraction, UserProfile, Wishlist, ItineraryDay, SiteSettings

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'itineraries_count', 'created_at')
    search_fields = ('name', 'description', 'visa_process')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')

    def itineraries_count(self, obj):
        return obj.itineraries.count()
    itineraries_count.short_description = 'Itineraries'

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'slug', 'created_at')
    list_filter = ('country',)
    search_fields = ('name', 'description', 'country__name')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = ('name', 'destination', 'opening_time', 'closing_time')
    list_filter = ('destination__country', 'destination')
    search_fields = ('name', 'description', 'destination__name')

class ItineraryDayInline(admin.TabularInline):
    model = ItineraryDay
    extra = 1
    fields = ('day_number', 'location_name', 'image', 'image_url', 'caption')

@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'country', 'duration_days', 'price', 'is_approved', 'is_custom', 'user', 'created_at')
    list_filter = ('is_approved', 'is_custom', 'is_premium', 'country', 'created_at')
    search_fields = ('title', 'country__name', 'description', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ItineraryDayInline]
    
    actions = ['approve_itineraries', 'unapprove_itineraries']

    def approve_itineraries(self, request, queryset):
        queryset.update(is_approved=True)
    approve_itineraries.short_description = "Approve selected itineraries"

    def unapprove_itineraries(self, request, queryset):
        queryset.update(is_approved=False)
    unapprove_itineraries.short_description = "Unapprove selected itineraries"

@admin.register(ItineraryDay)
class ItineraryDayAdmin(admin.ModelAdmin):
    list_display = ('itinerary', 'day_number', 'location_name', 'caption')
    list_filter = ('itinerary__country', 'day_number')
    search_fields = ('itinerary__title', 'location_name', 'caption')
    ordering = ('itinerary', 'day_number')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'itinerary', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email', 'itinerary__title', 'razorpay_order_id', 'razorpay_payment_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'city', 'country', 'zip_code')
    search_fields = ('user__username', 'user__email', 'phone_number', 'city', 'country')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'itinerary', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'itinerary__title')

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('custom_itinerary_price', 'custom_itinerary_regular_price')
    
    def has_add_permission(self, request):
        # Prevent creating more than one instance
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)
