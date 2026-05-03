import requests
from django.conf import settings
from django.core.files.base import ContentFile
import uuid
import os

def fetch_unsplash_images(query, count=2):
    """
    Fetch image URLs from Unsplash based on a search query.
    """
    access_key = getattr(settings, 'UNSPLASH_ACCESS_KEY', None)
    if not access_key or access_key == 'your_unsplash_access_key':
        return []

    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": query,
        "per_page": count,
        "orientation": "landscape",
        "client_id": access_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return [photo['urls']['regular'] for photo in data.get('results', [])]
    except Exception as e:
        print(f"Error fetching Unsplash images: {e}")
    
    return []

def download_image_to_content_file(url):
    """
    Download an image and return it as a Django ContentFile.
    """
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            filename = f"{uuid.uuid4()}.jpg"
            return ContentFile(response.content, name=filename)
    except Exception as e:
        print(f"Error downloading image: {e}")
    return None
