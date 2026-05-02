import os
import django
import sys
from django.core.files import File
from django.utils.text import slugify

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Itinerary

# Mapping of itinerary title to local file path
ITINERARY_IMAGES = {
    "Thailand 10 Days (BKK+PAT+PHU)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_10d_1777752636637.png",
    "Bangkok 3 Days Smart Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_bkk_3d_1777753249731.png",
    "Bangkok & Pattaya 6 Days": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_bkk_pat_6d_1777753308587.png",
    "Bangkok & Phuket 7 Days": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_bkk_phu_7d_1777752704408.png",
    "Pattaya 3 Days Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_pat_3d_1777753378099.png",
    "Pattaya & Phuket 7 Days": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_phu_4d_1777753451069.png",
    "Phuket 4 Days Explorer": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_thailand_phu_4d_1777753451069.png",
    
    "Vietnam 12 Days (North to South)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_vietnam_12d_1777753533126.png",
    "Vietnam 3 Days Hanoi Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_vietnam_hanoi_3d_1777753621678.png",
    "Vietnam 6 Days (North + Central)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_vietnam_12d_1777753533126.png",
    "Vietnam 9 Days (Comprehensive)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_vietnam_12d_1777753533126.png",
    "PhuQuoc 3 Days Island Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_vietnam_phuquoc_3d_1777753714723.png",
    
    "Malaysia 3 Days KL Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_malaysia_kl_3d_1777753916351.png",
    "Malaysia 5 Days (KL + Langkawi)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_malaysia_kl_langkawi_5d_1777753814031.png",
    "Malaysia 7 Days (The Loop)": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_malaysia_kl_langkawi_5d_1777753814031.png",
    
    "Hong Kong 5 Days Magic": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/itinerary_hongkong_5d_1777754018987.png",
    
    "Hyderabad 3 Days Guide": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_india_1777752141678.png",
    "Hyderabad 5 Days Explorer": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_india_1777752141678.png"
}

def sync():
    for title, path in ITINERARY_IMAGES.items():
        try:
            itinerary = Itinerary.objects.get(title=title)
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    # Django handles the upload to S3 automatically
                    # Note: We need to ensure itinerary.id is passed or handled in upload_to
                    # Since itinerary.id exists (it's in DB), it will be used in our path logic
                    itinerary.image.save(f"{slugify(title)}.png", File(f), save=True)
                print(f"Successfully synced itinerary: {title}")
            else:
                print(f"File not found: {path}")
        except Itinerary.DoesNotExist:
            print(f"Itinerary not found: {title}")
        except Exception as e:
            print(f"Error syncing {title}: {e}")

if __name__ == "__main__":
    sync()
