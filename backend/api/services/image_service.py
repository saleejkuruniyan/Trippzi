import requests
from django.conf import settings
from django.core.files.base import ContentFile
import uuid

class ImageService:
    def __init__(self):
        self.access_key = getattr(settings, 'UNSPLASH_ACCESS_KEY', None)
        self.api_url = "https://api.unsplash.com/search/photos"

    def fetch_unsplash_images(self, query, count=2):
        """
        Fetch image URLs from Unsplash based on a search query.
        """
        if not self.access_key or self.access_key == 'your_unsplash_access_key':
            print("[ImageService] Unsplash Access Key missing or default.")
            return []

        params = {
            "query": query,
            "per_page": count,
            "orientation": "landscape",
            "client_id": self.access_key
        }
        
        try:
            response = requests.get(self.api_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return [photo['urls']['regular'] for photo in data.get('results', [])]
            else:
                print(f"[ImageService] API Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"[ImageService] Exception: {e}")
        
        return []

    def download_image(self, url):
        """
        Download an image and return it as a Django ContentFile.
        """
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                filename = f"{uuid.uuid4()}.jpg"
                return ContentFile(response.content, name=filename)
        except Exception as e:
            print(f"[ImageService] Download error: {e}")
        return None
