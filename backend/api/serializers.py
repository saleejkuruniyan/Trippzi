from rest_framework import serializers
from .models import Destination, Itinerary, VisaRule, Transaction, UserProfile, ItineraryDay
from django.contrib.auth.models import User
from django.db.models import Q

class ItineraryDaySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False)
    class Meta:
        model = ItineraryDay
        fields = ['day_number', 'location_name', 'image', 'image_url', 'caption']

class SimpleItinerarySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Itinerary
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Rule: Mask thumbnail if not approved
        if not instance.is_approved:
            data['image'] = None
            data['image_url'] = None
        return data

class DestinationSerializer(serializers.ModelSerializer):
    itineraries_count = serializers.IntegerField(source='itineraries.count', read_only=True)
    itineraries = serializers.SerializerMethodField()
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Destination
        fields = '__all__'

    def get_itineraries(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        itineraries = obj.itineraries.all()
        if not (user and user.is_authenticated and user.is_staff):
            # For non-staff, apply visibility rules
            query = Q(is_custom=False, is_approved=True)
            if user and user.is_authenticated:
                query |= Q(is_custom=True, user=user)
            itineraries = itineraries.filter(query).distinct()
            
        return SimpleItinerarySerializer(itineraries, many=True, context=self.context).data

class ItinerarySerializer(serializers.ModelSerializer):
    destination_details = DestinationSerializer(source='destination_rel', read_only=True)
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
        
        # Check ownership
        is_owned = False
        if user and user.is_authenticated:
            is_owned = Transaction.objects.filter(user=user, itinerary=instance, status='COMPLETED').exists()
            if not is_owned and instance.user == user:
                is_owned = True # User is the creator of this custom trip

        # If not owned, mask all days except Day 1
        if not is_owned:
            original_content = data.get('content', [])
            if isinstance(original_content, list) and len(original_content) > 0:
                data['content'] = original_content[:1] # Only Day 1
            
            # Mask day_details too
            if 'day_details' in data:
                data['day_details'] = [d for d in data['day_details'] if d.get('day_number') == 1]
        
        # Rule: Mask thumbnail if not approved
        if not instance.is_approved:
            data['image'] = None
            data['image_url'] = None
                
        return data

    def get_is_owned(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            # Re-use logic for consistency
            is_purchased = Transaction.objects.filter(user=request.user, itinerary=obj, status='COMPLETED').exists()
            return is_purchased or obj.user == request.user
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
