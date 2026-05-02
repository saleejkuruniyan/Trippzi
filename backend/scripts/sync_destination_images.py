import os
import django
import sys
from django.core.files import File
from django.utils.text import slugify

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Destination

# Mapping of destination name to local file path
IMAGES_MAPPING = {
    "Thailand": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_thailand_1777751851424.png",
    "Vietnam": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_vietnam_1777751880133.png",
    "Malaysia": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_malaysia_1777751928043.png",
    "Hong Kong": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_hongkong_1777751987934.png",
    "India": "/Users/saleejkuruniyan/.gemini/antigravity/brain/3a7f74bd-e9a2-4e8b-b93f-4710a4b85cdb/dest_india_1777752141678.png"
}

def sync():
    for name, path in IMAGES_MAPPING.items():
        try:
            dest = Destination.objects.get(name=name)
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    # Django's ImageField .save() handles the upload to S3 automatically
                    dest.image.save(f"{slugify(name)}.png", File(f), save=True)
                print(f"Successfully synced image for {name}")
            else:
                print(f"File not found: {path}")
        except Destination.DoesNotExist:
            print(f"Destination {name} not found in DB")
        except Exception as e:
            print(f"Error syncing {name}: {e}")

if __name__ == "__main__":
    sync()
