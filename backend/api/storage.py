import os
from urllib.parse import urljoin
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class R2Storage(S3Boto3Storage):
    """
    Custom storage backend for S3-compatible storage.
    Automatically handles public CDN URLs if configured.
    """
    access_key = settings.S3_ACCESS_KEY_ID
    secret_key = settings.S3_SECRET_ACCESS_KEY
    bucket_name = settings.S3_STORAGE_BUCKET_NAME
    endpoint_url = settings.S3_ENDPOINT_URL
    signature_version = getattr(settings, 'S3_SIGNATURE_VERSION', 's3v4')
    
    file_overwrite = False
    querystring_auth = False # Set to False for public assets
    
    object_parameters = {
        'CacheControl': 'max-age=86400',
    }

    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the appropriate URL for a stored file.
        Uses CDN_URL if configured, otherwise falls back to default S3 URL.
        """
        cdn_url = getattr(settings, 'CDN_URL', None)
        if cdn_url:
            return urljoin(cdn_url.rstrip('/') + '/', name.lstrip('/'))

        return super().url(name, parameters=parameters, expire=expire, http_method=http_method)
