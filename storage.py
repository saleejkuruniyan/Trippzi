"""
Custom storage backend for Cloudflare R2 using AWS S3-compatible API.

URL Strategy
------------
- Sensitive files (video, audio, archives): Cloudflare Worker JWT URL
  → https://<CDN_URL>/<path>?token=<signed-jwt>
  → The Cloudflare Worker validates the JWT before serving R2 content.
  → Falls back to boto3 S3 presigned URL when CDN_URL or WORKER_SECRET is not set.

- Non-sensitive files (images, PDFs, CSS, JS): plain CDN URL
  → https://<CDN_URL>/<path>  (served publicly, no token)
  → Falls back to boto3 signed URL when CDN_URL is not set.
"""
import os
import time
import logging
import hmac
import hashlib
import json
import base64
from urllib.parse import urljoin

from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

logger = logging.getLogger(__name__)

# File extensions that require access control via signed JWT.
SENSITIVE_EXTENSIONS = {
    '.mp4', '.mkv', '.mov', '.avi', '.wmv',   # Video
    '.mp3', '.wav', '.m4a', '.flac', '.ogg',  # Audio
    '.zip', '.rar', '.7z',                    # Archives
}


def _b64url_encode(data: bytes) -> str:
    """URL-safe base64 encoding without padding (RFC 7515)."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def _generate_jwt(payload: dict, secret: str) -> str:
    """
    Generate a compact HS256 JWT without a third-party library.
    Works with the Cloudflare Worker's WebCrypto-based verifier.
    """
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(',', ':')).encode())
    body = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode())
    signing_input = f"{header}.{body}"
    sig = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_b64url_encode(sig)}"


class R2Storage(S3Boto3Storage):
    """
    Custom storage backend for Cloudflare R2 (S3-compatible).

    Automatically selects the correct URL strategy per file type:
      - Sensitive media  → Cloudflare Worker JWT URL (or S3 presigned fallback)
      - Public assets    → CDN URL (or S3 presigned fallback)
    """

    # S3 / R2 connection settings pulled from Django settings
    access_key = settings.S3_ACCESS_KEY_ID
    secret_key = settings.S3_SECRET_ACCESS_KEY
    bucket_name = settings.S3_STORAGE_BUCKET_NAME
    endpoint_url = settings.S3_ENDPOINT_URL
    region_name = 'us-east-1'
    signature_version = getattr(settings, 'S3_SIGNATURE_VERSION', 's3v4')

    file_overwrite = False
    querystring_auth = True          # Keep boto3 signing capability for fallback
    querystring_expire = 3600        # 1 hour — used by boto3 presigned fallback

    object_parameters = {
        'CacheControl': 'max-age=86400',  # 1 day browser cache for non-sensitive files
    }

    # ------------------------------------------------------------------ #
    # URL generation                                                       #
    # ------------------------------------------------------------------ #

    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the appropriate URL for a stored file.

        Sensitive files  → JWT-signed CDN URL (Cloudflare Worker validates it)
        Public files     → Plain CDN URL or boto3 presigned fallback
        """
        _, ext = os.path.splitext(name.lower())

        if ext in SENSITIVE_EXTENSIONS:
            return self._sensitive_url(name)

        # Public / non-sensitive files
        cdn_url = getattr(settings, 'CDN_URL', None)
        if cdn_url:
            return urljoin(cdn_url.rstrip('/') + '/', name.lstrip('/'))

        # Fallback: boto3 S3 presigned URL
        return super().url(name, parameters=parameters, expire=expire, http_method=http_method)

    def _sensitive_url(self, name: str) -> str:
        """
        Return a CDN URL with a short-lived JWT query parameter for sensitive files.

        If CDN_URL or WORKER_SECRET is not configured (e.g. local dev), falls back
        to a boto3 S3 presigned URL so the app still works without the Worker.
        """
        cdn_url = getattr(settings, 'CDN_URL', None)
        worker_secret = getattr(settings, 'WORKER_SECRET', None)

        if cdn_url and worker_secret:
            return self._build_worker_jwt_url(name, cdn_url, worker_secret)

        # Fallback: boto3 presigned URL for local dev / missing config
        logger.debug(
            "WORKER_SECRET or CDN_URL not set — falling back to S3 presigned URL for %s", name
        )
        return super().url(name)

    def _build_worker_jwt_url(self, file_path: str, cdn_url: str, secret: str) -> str:
        """
        Build: https://<cdn_url>/<file_path>?token=<hs256-jwt>

        JWT payload:
          file      — exact R2 object path the token authorises (Worker validates this)
          user_id   — authenticated user's PK, or null for guests
          user_type — "authenticated" | "guest"
          iat       — issued-at epoch seconds
          exp       — expiry epoch seconds (iat + 1 hour)
        """
        from core.middleware.request_context import get_current_user

        user = get_current_user()
        now = int(time.time())

        payload = {
            'file': file_path,
            'user_id': user.id if user else None,
            'user_type': 'authenticated' if user else 'guest',
            'iat': now,
            'exp': now + 600,  # 10 mins
        }

        token = _generate_jwt(payload, secret)
        clean_path = file_path.lstrip('/')
        base_url = urljoin(cdn_url.rstrip('/') + '/', clean_path)
        return f"{base_url}?token={token}"
