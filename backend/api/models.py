from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import uuid
import os

def destination_image_path(instance, filename):
    ext = filename.split('.')[-1]
    name = slugify(instance.name)
    return f"images/{name}/{uuid.uuid4()}.{ext}"

def itinerary_image_path(instance, filename):
    ext = filename.split('.')[-1]
    country = slugify(instance.destination)
    # If instance.id is not yet available, use 'temp' or omit
    itinerary_part = f"{instance.id}/" if instance.id else ""
    return f"images/{country}/{itinerary_part}{uuid.uuid4()}.{ext}"

def itinerary_day_image_path(instance, filename):
    country = slugify(instance.itinerary.country.name if instance.itinerary.country else 'generic')
    itinerary_id = instance.itinerary.id
    day_number = instance.day_number
    return f"images/{country}/{itinerary_id}/{day_number}/{uuid.uuid4()}.png"

class Country(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to=destination_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Rich Guide Content
    airports = models.JSONField(default=list, help_text="List of major airports")
    best_time = models.TextField(help_text="Best time to visit description")
    visa_process = models.TextField(help_text="Detailed visa process description")
    days_recommendation = models.JSONField(default=dict, help_text="Duration vs description mapping")
    tips = models.JSONField(default=list, help_text="Pro-tips and things to keep in mind")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Countries"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Destination(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='destinations', null=True, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    description = models.TextField()
    culture = models.TextField(blank=True)
    image = models.ImageField(upload_to=destination_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('country', 'slug')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.country.name}"

class Attraction(models.Model):
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='attractions', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to=destination_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    suggested_duration = models.DurationField(null=True, blank=True, help_text="Time to spend at this attraction")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.destination.name})"

class Itinerary(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='itineraries', null=True)
    destinations = models.ManyToManyField(Destination, related_name='itineraries_included')
    title = models.CharField(max_length=255)
    destination = models.CharField(max_length=255, help_text="Legacy field or primary destination summary")
    duration_days = models.IntegerField()
    
    # Pricing
    regular_price = models.DecimalField(max_digits=10, decimal_places=2, default=999.00)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=799.00)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    description = models.TextField()
    highlights = models.TextField(blank=True, help_text="Short highlight e.g. 'Kuala Lumpur + Langkawi'")
    content = models.JSONField(help_text="Detailed day-wise itinerary with timings and transfers")
    image = models.ImageField(upload_to=itinerary_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    is_premium = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_itineraries', null=True, blank=True)
    is_custom = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Itineraries"

    def __str__(self):
        return f"{self.title} ({self.country.name if self.country else 'No Country'})"

class ItineraryDay(models.Model):
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE, related_name='day_details')
    day_number = models.IntegerField()
    location_name = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to=itinerary_day_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['day_number']

    def __str__(self):
        return f"{self.itinerary.title} - Day {self.day_number}"

class VisaRule(models.Model):
    source_country = models.CharField(max_length=100)
    destination_country = models.CharField(max_length=100)
    visa_required = models.BooleanField(default=True)
    requirements = models.TextField(blank=True)
    documentation = models.JSONField(help_text="Required documents list", default=list)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('source_country', 'destination_country')

    def __str__(self):
        return f"Visa: {self.source_country} -> {self.destination_country}"

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='PENDING')
    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True, default='India')
    zip_code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'itinerary')

    def __str__(self):
        return f"{self.user.username} wants {self.itinerary.title}"

# Signals to auto-create profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()
