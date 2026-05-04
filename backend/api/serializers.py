from rest_framework import serializers
from .models import Country, Destination, Attraction, Itinerary, VisaRule, Transaction, UserProfile, ItineraryDay, SiteSettings
from django.contrib.auth.models import User
from django.db.models import Q

class ItineraryDaySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False)
    class Meta:
        model = ItineraryDay
        fields = ['day_number', 'location_name', 'image', 'image_url', 'caption']

class AttractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attraction
        fields = '__all__'

class DestinationSerializer(serializers.ModelSerializer):
    attractions = AttractionSerializer(many=True, read_only=True)
    class Meta:
        model = Destination
        fields = '__all__'

class CountrySerializer(serializers.ModelSerializer):
    itineraries_count = serializers.IntegerField(source='itineraries.count', read_only=True)
    itineraries = serializers.SerializerMethodField()
    destinations = DestinationSerializer(many=True, read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Country
        fields = '__all__'

    def get_itineraries(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        itineraries = obj.itineraries.all()
        if not (user and user.is_authenticated and user.is_staff):
            query = Q(is_custom=False, is_approved=True)
            if user and user.is_authenticated:
                query |= Q(is_custom=True, user=user)
            itineraries = itineraries.filter(query).distinct()
            
        return SimpleItinerarySerializer(itineraries, many=True, context=self.context).data

class SimpleItinerarySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Itinerary
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = request.user if request else None
        
        is_owned = False
        if user and user.is_authenticated:
            if instance.user == user:
                is_owned = True
            elif Transaction.objects.filter(user=user, itinerary=instance, status='COMPLETED').exists():
                is_owned = True
        if instance.is_custom and not is_owned and not (user and user.is_staff):
            # Mask image and sensitive metadata for unapproved/unowned custom trips
            if not instance.is_approved:
                data['image'] = None
                data['image_url'] = None
            
            # Show only Day 1 as a teaser in the content
            if isinstance(data.get('content'), list) and len(data['content']) > 0:
                data['content'] = data['content'][:1]
            else:
                data['content'] = []
        elif not instance.is_approved and not is_owned and not (user and user.is_staff):
            data['image'] = None
            data['image_url'] = None

        # Dynamic pricing for custom itineraries from global settings
        if instance.is_custom:
            from .models import SiteSettings
            settings = SiteSettings.get_settings()
            data['sale_price'] = settings.custom_itinerary_price
            data['regular_price'] = settings.custom_itinerary_regular_price
            data['price'] = settings.custom_itinerary_price

        return data

class ItinerarySerializer(serializers.ModelSerializer):
    country_details = CountrySerializer(source='country', read_only=True)
    destinations_details = DestinationSerializer(source='destinations', many=True, read_only=True)
    day_details = ItineraryDaySerializer(many=True, read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    is_owned = serializers.SerializerMethodField()
    
    class Meta:
        model = Itinerary
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = request.user if request else None
        
        # Check ownership and paid status
        is_paid = False
        is_owner = False
        if user and user.is_authenticated:
            is_paid = Transaction.objects.filter(user=user, itinerary=instance, status='COMPLETED').exists()
            is_owner = instance.user == user

        # If not paid AND not owner, mask all days except Day 1
        if not is_paid and not is_owner:
            original_content = data.get('content', [])
            if isinstance(original_content, list) and len(original_content) > 0:
                data['content'] = original_content[:1] # Only Day 1
            
            # Mask day_details too
            if 'day_details' in data:
                data['day_details'] = [d for d in data['day_details'] if d.get('day_number') == 1]
        
        # Inject dynamic pricing from SiteSettings for custom itineraries if not owned/paid
        if instance.is_custom and not is_paid:
            from .models import SiteSettings
            settings_obj = SiteSettings.get_settings()
            data['sale_price'] = str(settings_obj.custom_itinerary_price)
            data['regular_price'] = str(settings_obj.custom_itinerary_regular_price)
                
        # Check if PDF exists (for superadmin cloning)
        if user and user.is_staff:
            from django.core.files.storage import default_storage
            from django.utils.text import slugify
            country_slug = slugify(instance.country.name if instance.country else 'generic')
            prefix = f"itinerary/{country_slug}/{instance.id}/"
            try:
                _, files = default_storage.listdir(prefix)
                data['has_pdf'] = any(f.endswith('.pdf') for f in files)
            except:
                data['has_pdf'] = False
                
        return data

    def get_is_owned(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Transaction.objects.filter(user=request.user, itinerary=obj, status='COMPLETED').exists()
        return False

class VisaRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisaRule
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'address', 'city', 'country', 'zip_code']

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_staff', 'date_joined', 'profile']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'
