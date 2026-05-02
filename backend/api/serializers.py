from rest_framework import serializers
from .models import Destination, Itinerary, VisaRule, Transaction
from django.contrib.auth.models import User

class DestinationSerializer(serializers.ModelSerializer):
    itineraries_count = serializers.IntegerField(source='itineraries.count', read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Destination
        fields = '__all__'

class ItinerarySerializer(serializers.ModelSerializer):
    destination_details = DestinationSerializer(source='destination_rel', read_only=True)
    image = serializers.ImageField(use_url=True, required=False)
    
    class Meta:
        model = Itinerary
        fields = '__all__'

class VisaRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisaRule
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
