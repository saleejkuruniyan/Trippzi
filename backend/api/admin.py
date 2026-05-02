from django.contrib import admin
from .models import Itinerary, VisaRule, Transaction

@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'duration_days', 'price', 'is_premium', 'created_at')
    list_filter = ('is_premium', 'destination', 'created_at')
    search_fields = ('title', 'destination', 'description')
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
