from celery import shared_task
import time
from .services.ai_engine import AIEngine
from .models import Itinerary

@shared_task
def generate_itinerary_async(destination, duration, budget, style, interests, itinerary_id):
    """
    Generates an itinerary in the background.
    """
    ai_engine = AIEngine()
    result = ai_engine.generate_itinerary(destination, duration, budget, style, interests)
    
    itinerary = Itinerary.objects.get(id=itinerary_id)
    itinerary.content = result
    itinerary.save()
    
    return f"Itinerary {itinerary_id} generated successfully."

@shared_task
def sync_visa_rules():
    """
    Periodic task to sync/update visa rules.
    """
    # Logic to fetch latest visa data from an external API
    print("Syncing visa rules...")
    return "Visa rules sync completed."
