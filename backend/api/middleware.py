import logging
import json
import time
from django.conf import settings

logger = logging.getLogger('api_logger')

class APILoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not getattr(settings, 'API_LOGGING', False):
            return self.get_response(request)

        # Start timer
        start_time = time.time()

        # Log Request
        path = request.path
        method = request.method
        
        # Don't log sensitive endpoints if possible, or truncate body
        body = ""
        if request.body and request.content_type == 'application/json':
            try:
                body_json = json.loads(request.body)
                # Mask sensitive fields if necessary (e.g., password)
                if 'password' in body_json:
                    body_json['password'] = '********'
                body = json.dumps(body_json)
            except Exception:
                body = "[Binary/Malformed Data]"
        
        logger.info(f"REQUEST: {method} {path} | Body: {body}")

        response = self.get_response(request)

        # Log Response
        duration = time.time() - start_time
        status_code = response.status_code
        
        content = ""
        if 'application/json' in response.get('Content-Type', ''):
            try:
                content = response.content.decode('utf-8')
                # Truncate very long responses
                if len(content) > 1000:
                    content = content[:1000] + "... [truncated]"
            except Exception:
                content = "[Binary/Malformed Data]"
        else:
            content = f"[{response.get('Content-Type', 'Unknown Content Type')}]"

        logger.info(f"RESPONSE: {method} {path} | Status: {status_code} | Duration: {duration:.2f}s | Content: {content}")

        return response
