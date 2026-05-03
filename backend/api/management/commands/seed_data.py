import json
import os
from django.core.management.base import BaseCommand
from api.models import Country, Destination, Attraction, Itinerary, ItineraryDay
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed the database with real tourism data for 100 countries'

    def handle(self, *args, **options):
        self.stdout.write('Starting real-data seed for 100 countries...')

        # Clear existing data to ensure a clean, high-quality seed
        self.stdout.write('Cleaning up old data...')
        ItineraryDay.objects.all().delete()
        Itinerary.objects.all().delete()
        Attraction.objects.all().delete()
        Destination.objects.all().delete()
        Country.objects.all().delete()

        json_path = os.path.join(os.path.dirname(__file__), 'countries_data.json')
        with open(json_path, 'r') as f:
            countries_data = json.load(f)

        for c_data in countries_data:
            country = Country.objects.create(
                name=c_data['name'],
                slug=slugify(c_data['name']),
                description=c_data['description'],
                visa_process=c_data['visa_for_indians'],
                airports=c_data['airports'],
                image_url=f"https://source.unsplash.com/featured/?{slugify(c_data['name'])},tourism"
            )
            
            self.stdout.write(f"Created Country: {country.name}")

            # Create Destinations
            for d_data in c_data['top5']:
                destination = Destination.objects.create(
                    country=country,
                    name=d_data['name'],
                    slug=slugify(f"{country.name}-{d_data['name']}"),
                    description=d_data['description'],
                    image_url=f"https://source.unsplash.com/featured/?{slugify(d_data['name'])},city"
                )

                # Real attractions for major cities
                real_attractions = {
                    "Paris": [
                        {"name": "Eiffel Tower", "type": "Landmark", "duration": "02:00", "desc": "The global icon of France and one of the most recognizable structures in the world."},
                        {"name": "Louvre Museum", "type": "Museum", "duration": "04:00", "desc": "The world's largest art museum, home to the Mona Lisa and Venus de Milo."},
                        {"name": "Notre-Dame Cathedral", "type": "History", "duration": "01:30", "desc": "A masterpiece of French Gothic architecture on the Île de la Cité."}
                    ],
                    "Rome": [
                        {"name": "Colosseum", "type": "History", "duration": "02:00", "desc": "The largest ancient amphitheatre ever built, symbolizing the power of the Roman Empire."},
                        {"name": "Vatican Museums", "type": "Culture", "duration": "03:30", "desc": "Home to the Sistine Chapel and vast collections of art and sculpture."},
                        {"name": "Trevi Fountain", "type": "Landmark", "duration": "00:45", "desc": "The largest Baroque fountain in the city and a world-famous site for coin-throwing."}
                    ],
                    "London": [
                        {"name": "British Museum", "type": "Culture", "duration": "03:00", "desc": "Dedicated to human history, art and culture, housing the Rosetta Stone."},
                        {"name": "London Eye", "type": "Landmark", "duration": "01:00", "desc": "A giant Ferris wheel on the South Bank of the River Thames with panoramic views."},
                        {"name": "Tower of London", "type": "History", "duration": "02:30", "desc": "A historic castle on the north bank of the Thames, home to the Crown Jewels."}
                    ],
                    "New York City": [
                        {"name": "Statue of Liberty", "type": "Landmark", "duration": "03:00", "desc": "A colossal neoclassical sculpture on Liberty Island, a gift from France."},
                        {"name": "Central Park", "type": "Nature", "duration": "02:00", "desc": "The most visited urban park in the US, offering a green escape in Manhattan."},
                        {"name": "Empire State Building", "type": "Landmark", "duration": "01:30", "desc": "A 102-story Art Deco skyscraper that was the world's tallest for 40 years."}
                    ],
                    "Dubai": [
                        {"name": "Burj Khalifa", "type": "Landmark", "duration": "02:00", "desc": "The world's tallest building, offering breathtaking views from its observation decks."},
                        {"name": "Dubai Mall", "type": "Shopping", "duration": "04:00", "desc": "The largest mall in the world by total land area, featuring an aquarium and ice rink."},
                        {"name": "Palm Jumeirah", "type": "Landmark", "duration": "02:00", "desc": "A tree-shaped man-made island known for its luxury hotels and beach clubs."}
                    ]
                }

                if d_data['name'] in real_attractions:
                    attractions_templates = real_attractions[d_data['name']]
                else:
                    attractions_templates = [
                        {"name": f"Historic Center of {d_data['name']}", "type": "History", "duration": "03:00", "desc": f"The vibrant and historic heart of {d_data['name']}."},
                        {"name": f"{d_data['name']} Waterfront", "type": "Nature", "duration": "02:00", "desc": f"A scenic and relaxing area in {d_data['name']}."},
                        {"name": f"Museum of {d_data['name']}", "type": "Culture", "duration": "02:30", "desc": f"Showcasing the unique heritage and art of {d_data['name']}."}
                    ]

                for attr_tmpl in attractions_templates:
                    Attraction.objects.create(
                        destination=destination,
                        name=attr_tmpl['name'],
                        description=attr_tmpl['desc'],
                        opening_time="09:00:00",
                        closing_time="18:00:00",
                        suggested_duration=attr_tmpl['duration']
                    )

        # Create featured itineraries with detailed day-wise logic
        featured_countries = ["France", "Italy", "Spain", "USA", "Thailand", "Japan", "UAE"]
        for c_name in featured_countries:
            try:
                country = Country.objects.get(name=c_name)
                dests = country.destinations.all()[:3]
                
                itinerary = Itinerary.objects.create(
                    country=country,
                    title=f"The Ultimate {country.name} Explorer",
                    destination=", ".join([d.name for d in dests]),
                    description=f"Experience the very best of {country.name}. This 7-day curated journey takes you through iconic landmarks, hidden gems, and local favorites across {itinerary_days_desc if (itinerary_days_desc := ', '.join([d.name for d in dests])) else 'the country'}.",
                    duration_days=7,
                    price=1200 + (len(c_name) * 50), # Semi-random price
                    is_approved=True,
                    is_custom=False,
                    content=[] # Will populate below
                )
                itinerary.destinations.set(dests)
                
                itinerary_content = []
                for day_num in range(1, 8):
                    current_dest = dests[(day_num - 1) % len(dests)]
                    day_attractions = current_dest.attractions.all()
                    
                    activities = []
                    # Morning Activity
                    if day_attractions.count() > 0:
                        attr = day_attractions[0]
                        activities.append({
                            "time": "09:30",
                            "activity": f"Visit {attr.name}",
                            "location": current_dest.name,
                            "notes": attr.description
                        })
                    
                    # Afternoon Activity
                    if day_attractions.count() > 1:
                        attr = day_attractions[1]
                        activities.append({
                            "time": "14:00",
                            "activity": f"Explore {attr.name}",
                            "location": current_dest.name,
                            "notes": attr.description
                        })
                    
                    day_entry = {
                        "day": day_num,
                        "theme": f"Discovering {current_dest.name}",
                        "activities": activities,
                        "transfer": "Local Transport" if day_num > 1 else "Airport Transfer"
                    }
                    itinerary_content.append(day_entry)
                    
                    # Also create ItineraryDay objects for the frontend
                    ItineraryDay.objects.create(
                        itinerary=itinerary,
                        day_number=day_num,
                        location_name=current_dest.name,
                        caption=f"Day {day_num}: {current_dest.name} Highlights",
                        image_url=f"https://source.unsplash.com/featured/?{slugify(current_dest.name)},landscape"
                    )
                
                itinerary.content = itinerary_content
                itinerary.save()
                
            except Country.DoesNotExist:
                continue

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {Country.objects.count()} countries, {Destination.objects.count()} destinations, and {Attraction.objects.count()} attractions!'))
