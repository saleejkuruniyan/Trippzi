import json
import os
import urllib.request
import urllib.parse
from django.core.management.base import BaseCommand
from api.models import Country, Destination
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed the database with Countries and Destinations only (Basic Info)'

    def handle(self, *args, **options):
        self.stdout.write('Starting data seed for 100 countries...')

        # Clear existing data to ensure a clean, high-quality seed
        self.stdout.write('Cleaning up old data...')
        from api.models import Itinerary, ItineraryDay, Attraction
        ItineraryDay.objects.all().delete()
        Itinerary.objects.all().delete()
        Attraction.objects.all().delete()
        Destination.objects.all().delete()
        Country.objects.all().delete()

        json_path = os.path.join(os.path.dirname(__file__), 'countries_data.json')
        with open(json_path, 'r') as f:
            countries_data = json.load(f)

        def get_iso_code(name):
            try:
                # Common overrides for accuracy
                overrides = {
                    "USA": "us", "United States": "us", "UK": "gb", "United Kingdom": "gb",
                    "UAE": "ae", "United Arab Emirates": "ae", "South Korea": "kr", 
                    "Vietnam": "vn", "India": "in", "Australia": "au", "Germany": "de",
                    "France": "fr", "Italy": "it", "Spain": "es", "Japan": "jp", "China": "cn",
                    "Singapore": "sg", "Malaysia": "my", "Thailand": "th", "Switzerland": "ch",
                    "Netherlands": "nl", "Canada": "ca", "Brazil": "br", "Russia": "ru"
                }
                if name in overrides: return overrides[name]

                # Attempt 1: Full text exact match
                url = f"https://restcountries.com/v3.1/name/{urllib.parse.quote(name)}?fullText=true"
                with urllib.request.urlopen(url, timeout=5) as response:
                    data = json.loads(response.read().decode())
                    return data[0]['cca2'].lower()
            except:
                # Attempt 2: Fuzzy match
                try:
                    url = f"https://restcountries.com/v3.1/name/{urllib.parse.quote(name)}"
                    with urllib.request.urlopen(url, timeout=5) as response:
                        data = json.loads(response.read().decode())
                        return data[0]['cca2'].lower()
                except:
                    return "in" # Safe default for your primary market if all else fails

        for c_data in countries_data:
            name = c_data['name']
            iso_code = get_iso_code(name)
            
            # Seed Country with only Name, Slug, Description, and Visuals
            country = Country.objects.create(
                name=name,
                slug=slugify(name),
                description=c_data['description'],
                image_url=f"https://source.unsplash.com/featured/?{slugify(name)},tourism",
                flag_url=f"https://flagcdn.com/w160/{iso_code}.png"
            )
            
            self.stdout.write(f"Created Country: {country.name} (Flag: {iso_code})")

            # Create Destinations
            for d_data in c_data['top5']:
                Destination.objects.create(
                    country=country,
                    name=d_data['name'],
                    slug=slugify(f"{country.name}-{d_data['name']}"),
                    description=d_data['description'],
                    image_url=f"https://source.unsplash.com/featured/?{slugify(d_data['name'])},city"
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {Country.objects.count()} countries and {Destination.objects.count()} destinations!'))
