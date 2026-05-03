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
        # Actual paths found in your R2 storage
        storage_images = {
            "Thailand": "images/thailand/6992c217-e8b5-4922-8867-698dc46118d8.png",
            "Vietnam": "images/vietnam/92b15415-e4b6-4232-9fd0-1fe3c647058d.png",
            "Malaysia": "images/malaysia/f4a79d8e-afde-4b4b-b272-de4fb359c374.png",
            "Hong Kong": "images/hong-kong/4aba2f52-d819-4fa2-912d-832b06684a89.png",
            "India": "images/india/dc4846d7-7954-4ffc-9d85-ef0e21000194.png"
        }

        for d in dest_data:
            img_path = storage_images.get(d["name"])
            dest = Destination.objects.create(
                name=d["name"],
                slug=slugify(d["name"]),
                description=d["desc"],
                airports=d["airports"],
                best_time=d["best_time"],
                visa_process=d["visa"],
                days_recommendation=d["days"],
                tips=d["tips"],
                image=img_path, # Using your actual storage path
                image_url=f"https://trippzi.budlee.ai/{img_path}" # Using your CDN URL
            )
            dest_map[d["name"]] = dest

        # 4. Define All 18 Itineraries
        itineraries = [
            # Thailand (7)
            ("Thailand 10 Days (BKK+PAT+PHU)", "Thailand", 10, 1499, 1749, "Bangkok + Pattaya + Phuket", "images/thailand/2/60e6add1-22b9-40df-9393-d5bb114a08cf.png"),
            ("Bangkok 3 Days Smart Guide", "Thailand", 3, 499, 649, "Bangkok Highlights", "images/thailand/3/15ae4eed-812a-4f0f-938b-c655faf54c3a.png"),
            ("Bangkok & Pattaya 6 Days", "Thailand", 6, 899, 1049, "Bangkok & Pattaya", "images/thailand/4/acf787ab-a0f3-4d1b-a940-02d0fe3211dc.png"),
            ("Bangkok & Phuket 7 Days", "Thailand", 7, 999, 1249, "Bangkok & Phuket", "images/thailand/5/a814cb5a-7264-4616-bf7e-8f6810652fc3.png"),
            ("Pattaya 3 Days Guide", "Thailand", 3, 499, 649, "Pattaya Highlights", "images/thailand/6/8bd71483-223b-4e54-9d47-ad57d9715156.png"),
            ("Pattaya & Phuket 7 Days", "Thailand", 7, 999, 1249, "Pattaya & Phuket", "images/thailand/7/054f483e-7a12-4ca5-b420-ad9a451d3c7e.png"),
            ("Phuket 4 Days Explorer", "Thailand", 4, 599, 749, "Phuket Beaches", "images/thailand/8/c0370217-54fa-4884-8c9d-851feef2f3b0.png"),
            
            # Vietnam (5)
            ("Vietnam 12 Days (North to South)", "Vietnam", 12, 1799, 1999, "Hanoi + Danang + Hoian + HCM + PhuQuoc", "images/vietnam/9/3c16d50d-ea46-4aa4-874a-d4c190a0741c.png"),
            ("Vietnam 3 Days Hanoi Guide", "Vietnam", 3, 499, 649, "Hanoi Heritage", "images/vietnam/10/02acbd9c-7bf9-4429-89ee-1091118387ae.png"),
            ("Vietnam 6 Days (North + Central)", "Vietnam", 6, 899, 1049, "Hanoi & Hoi An", "images/vietnam/11/c00ff464-37cf-4486-b5fe-fddc70a046b4.png"),
            ("Vietnam 9 Days (Comprehensive)", "Vietnam", 9, 1299, 1449, "North, Central & South", "images/vietnam/12/10f37060-824a-4ac8-b353-d48b6ff53575.png"),
            ("PhuQuoc 3 Days Island Guide", "Vietnam", 3, 499, 649, "Island Paradise", "images/vietnam/13/4634eee9-6f09-4107-baa2-4feb74fa4103.png"),
            
            # Malaysia (3)
            ("Malaysia 3 Days KL Guide", "Malaysia", 3, 499, 649, "Kuala Lumpur City", "images/malaysia/14/2d86c997-7c68-4315-bc21-6d7ad39c7a08.png"),
            ("Malaysia 5 Days (KL + Langkawi)", "Malaysia", 5, 799, 999, "City + Island", "images/malaysia/15/eec40d15-1d48-47b3-988f-9c3792ed0739.png"),
            ("Malaysia 7 Days (The Loop)", "Malaysia", 7, 999, 1159, "Full Malaysia Loop", "images/malaysia/16/d14175ea-5c2b-4924-8f4a-e8801ce48665.png"),
            
            # Hong Kong (1)
            ("Hong Kong 5 Days Magic", "Hong Kong", 5, 799, 959, "City + Disney Magic", "images/hong-kong/17/76272ba9-5e29-460b-9ba2-bb2f9cb1e0ad.png"),
            
            # India (2)
            ("Hyderabad 3 Days Guide", "India", 3, 399, 549, "Historical Hyderabad", "images/india/18/32c58c1d-a634-453d-8829-9d245fafc751.png"),
            ("Hyderabad 5 Days Explorer", "India", 5, 599, 859, "Hyderabad & Ramoji", "images/india/19/10274605-dacf-41c6-8217-39145df3413b.png")
        ]

        for title, dest_name, days, sale, reg, high, img_path in itineraries:
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
                image=img_path,
                image_url=f"https://trippzi.budlee.ai/{img_path}"
            )

        # 5. Create Visa Rules
        visa_rules = [
            ("India", "Thailand", True, "30 days stay, Visa on Arrival available. Carry return flight and proof of funds.", ["Passport", "Photo", "Return Ticket"]),
            ("India", "Vietnam", True, "30-90 days stay, E-Visa required. Apply online at official portal.", ["Passport Copy", "Digital Photo"]),
            ("India", "Malaysia", False, "30 days stay, Visa Free for Indians. Must fill MDAC form 3 days prior.", ["Passport", "Return Ticket", "MDAC"]),
            ("India", "Hong Kong", False, "14 days stay, Pre-arrival registration (PAR) required.", ["Passport", "PAR Document"]),
        ]

        for src, dest, req, details, docs in visa_rules:
            VisaRule.objects.create(
                source_country=src,
                destination_country=dest,
                visa_required=req,
                requirements=details,
                documentation=docs
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(itineraries)} itineraries and {len(visa_rules)} visa rules!'))
