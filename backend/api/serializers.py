from rest_framework import serializers
from .models import Destination, Itinerary, VisaRule, Transaction, UserProfile
from django.contrib.auth.models import User

class SimpleItinerarySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Itinerary
        fields = '__all__'

class DestinationSerializer(serializers.ModelSerializer):
    itineraries_count = serializers.IntegerField(source='itineraries.count', read_only=True)
    itineraries = serializers.SerializerMethodField()
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Destination
        fields = '__all__'

    def get_itineraries(self, obj):
        return SimpleItinerarySerializer(obj.itineraries.all(), many=True, context=self.context).data

class ItinerarySerializer(serializers.ModelSerializer):
    destination_details = DestinationSerializer(source='destination_rel', read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    is_owned = serializers.SerializerMethodField()
    
    class Meta:
        model = Itinerary
        fields = '__all__'

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
