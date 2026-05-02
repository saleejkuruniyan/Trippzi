from django.core.management.base import BaseCommand
from api.models import Destination, Itinerary, VisaRule
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds the database with the FULL inventory of 18 itineraries and rich guides'

    def handle(self, *args, **options):
        self.stdout.write('Starting FULL inventory seed...')
        
        # 1. Clear existing data
        Itinerary.objects.all().delete()
        Destination.objects.all().delete()
        VisaRule.objects.all().delete()

        # 2. Define Destinations Data
        dest_data = [
            {
                "name": "Thailand",
                "desc": "The Land of Smiles, famous for its ornate temples, tropical beaches, and vibrant nightlife.",
                "airports": ["Suvarnabhumi (BKK)", "Don Mueang (DMK)", "Phuket (HKT)"],
                "best_time": "November to February. Cool and dry season.",
                "visa": "Visa-free entry for Indians (temporary exemption). Carry passport and return flights.",
                "days": {"3 Days": "Bangkok Only", "6 Days": "Bangkok & Pattaya", "10 Days": "Full Tour"},
                "tips": ["Use Bolt/Grab", "7-Eleven for SIM cards", "Respect Temples"]
            },
            {
                "name": "Vietnam",
                "desc": "Breath-taking landscapes, rich history, and incredible street food.",
                "airports": ["Noi Bai (HAN)", "Tan Son Nhat (SGN)", "Da Nang (DAD)"],
                "best_time": "January to April for best weather across the country.",
                "visa": "E-visa required (3-5 days). Apply at official govt portal.",
                "days": {"3 Days": "Hanoi", "9 Days": "Hanoi to Ho Chi Minh", "12 Days": "Full Journey"},
                "tips": ["Grab is essential", "Viettel SIM", "Carry VND cash"]
            },
            {
                "name": "Malaysia",
                "desc": "A land of diverse cultures, stunning skylines, and tropical paradises.",
                "airports": ["Kuala Lumpur (KUL)", "Penang (PEN)", "Langkawi (LGK)"],
                "best_time": "November to April.",
                "visa": "Visa-free for Indians. Must fill MDAC form 3 days prior.",
                "days": {"3 Days": "Kuala Lumpur", "5 Days": "KL + Langkawi", "7 Days": "Full Loop"},
                "tips": ["Grab app", "U Mobile SIM", "G-Type adapter"]
            },
            {
                "name": "Hong Kong",
                "desc": "A vibrant metropolis known for its skyline, street food, and Disney magic.",
                "airports": ["Hong Kong International (HKG)"],
                "best_time": "October to December.",
                "visa": "Pre-arrival registration required for Indians.",
                "days": {"5 Days": "City + Disneyland + Lantau Island"},
                "tips": ["Octopus Card is a must", "MTR is super efficient"]
            },
            {
                "name": "India",
                "desc": "Explore the heritage and modern charm of incredible India.",
                "airports": ["Hyderabad (HYD)", "Delhi (DEL)", "Mumbai (BOM)"],
                "best_time": "October to March.",
                "visa": "Local travel / Visa on Arrival for foreigners.",
                "days": {"3 Days": "City Highlights", "5 Days": "Extended Tour"},
                "tips": ["Use Rapido/Uber", "Street food caution", "UPI for all payments"]
            }
        ]

        # 3. Create Destinations
        dest_map = {}
        for d in dest_data:
            dest = Destination.objects.create(
                name=d["name"],
                slug=slugify(d["name"]),
                description=d["desc"],
                airports=d["airports"],
                best_time=d["best_time"],
                visa_process=d["visa"],
                days_recommendation=d["days"],
                tips=d["tips"],
                image_url=f"https://images.unsplash.com/photo-1528181304800-2f140819ad0c?auto=format&fit=crop&q=80&w=800" if d["name"] == "Thailand" else f"https://source.unsplash.com/featured/?{d['name']},travel"
            )
            dest_map[d["name"]] = dest

        # 4. Define All 18 Itineraries
        itineraries = [
            # Thailand (7)
            ("Thailand 10 Days (BKK+PAT+PHU)", "Thailand", 10, 1499, 1749, "Bangkok + Pattaya + Phuket"),
            ("Bangkok 3 Days Smart Guide", "Thailand", 3, 499, 649, "Bangkok Highlights"),
            ("Bangkok & Pattaya 6 Days", "Thailand", 6, 899, 1049, "City + Beach"),
            ("Bangkok & Phuket 7 Days", "Thailand", 7, 999, 1249, "City + Island"),
            ("Pattaya 3 Days Guide", "Thailand", 3, 499, 649, "Pattaya Discovery"),
            ("Pattaya & Phuket 7 Days", "Thailand", 7, 999, 1249, "Multi-Island Experience"),
            ("Phuket 4 Days Explorer", "Thailand", 4, 599, 749, "Phuket Beaches"),
            
            # Vietnam (5)
            ("Vietnam 12 Days (North to South)", "Vietnam", 12, 1799, 1999, "Hanoi + Danang + Hoian + HCM + PhuQuoc"),
            ("Vietnam 3 Days Hanoi Guide", "Vietnam", 3, 499, 649, "Hanoi City"),
            ("Vietnam 6 Days (North + Central)", "Vietnam", 6, 899, 1049, "Hanoi + Danang + Hoian"),
            ("Vietnam 9 Days (Comprehensive)", "Vietnam", 9, 1299, 1449, "Hanoi + Danang + Hoian + HCM"),
            ("PhuQuoc 3 Days Island Guide", "Vietnam", 3, 499, 649, "Phu Quoc Island"),
            
            # Malaysia (3)
            ("Malaysia 3 Days KL Guide", "Malaysia", 3, 499, 649, "Kuala Lumpur"),
            ("Malaysia 5 Days (KL + Langkawi)", "Malaysia", 5, 799, 999, "KL + Langkawi Island"),
            ("Malaysia 7 Days (The Loop)", "Malaysia", 7, 999, 1159, "KL + Langkawi + Penang"),
            
            # Hong Kong (1)
            ("Hong Kong 5 Days Magic", "Hong Kong", 5, 799, 959, "City + Disney"),
            
            # India (2)
            ("Hyderabad 3 Days Guide", "India", 3, 399, 549, "Charminar & More"),
            ("Hyderabad 5 Days Explorer", "India", 5, 599, 859, "City + Ramoji Film City")
        ]

        for title, dest_name, days, sale, reg, high in itineraries:
            Itinerary.objects.create(
                destination_rel=dest_map.get(dest_name),
                title=title,
                destination=dest_name,
                duration_days=days,
                sale_price=sale,
                regular_price=reg,
                price=sale,
                highlights=high,
                description=f"Expertly curated {days}-day travel guide for {dest_name}. Includes flights, hotels, and daily logistics.",
                content=[{"day": i+1, "activity": f"Activity for Day {i+1} in {dest_name}"} for i in range(days)],
                image_url=f"https://source.unsplash.com/featured/?{dest_name},travel"
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(itineraries)} itineraries!'))
