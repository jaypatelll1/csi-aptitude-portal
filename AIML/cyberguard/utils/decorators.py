import asyncio
import functools
import time
from typing import Dict
from flask import request, jsonify
from config.setting import config
from models.schemas import APIResponse

# In-memory rate limit store
_rate_limit_store: Dict[str, int] = {}

def async_route(f):
    """Decorator to handle async routes in Flask"""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        # Check if there's already a running event loop
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # No running loop, create a new one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(f(*args, **kwargs))
            finally:
                loop.close()
        else:
            # There's already a running loop, use run_in_executor
            return asyncio.create_task(f(*args, **kwargs))
    return wrapper

def require_api_key(f):
    """Decorator to require API key authentication"""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get(config.API_KEY_HEADER)
        
        if not api_key or not api_key.strip():
            response = APIResponse(
                success=False, 
                error="Missing or invalid API key. Include X-API-Key header."
            )
            return jsonify(response.__dict__), 401
            
        # Here you could add more sophisticated API key validation
        # For now, we just check if it exists and is not empty
        
        return f(*args, **kwargs)
    return wrapper

def rate_limit(max_requests: int = None, window_seconds: int = 60):
    """Decorator to implement rate limiting"""
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Use config value if not specified
            max_reqs = max_requests or config.RATE_LIMIT_PER_MINUTE
            
            # Get client IP (handle proxy headers)
            client_ip = (
                request.headers.get('X-Forwarded-For', '').split(',')[0].strip() or
                request.headers.get('X-Real-IP') or
                request.environ.get('HTTP_X_REAL_IP') or
                request.remote_addr
            )
            
            # Create time window key
            current_window = int(time.time() // window_seconds)
            rate_key = f"{client_ip}:{current_window}"
            
            # Check current request count
            current_requests = _rate_limit_store.get(rate_key, 0)
            
            if current_requests >= max_reqs:
                response = APIResponse(
                    success=False,
                    error=f"Rate limit exceeded. Maximum {max_reqs} requests per {window_seconds} seconds."
                )
                return jsonify(response.__dict__), 429
            
            # Increment request count
            _rate_limit_store[rate_key] = current_requests + 1
            
            # Cleanup old entries periodically
            if len(_rate_limit_store) > 10000:
                cleanup_cutoff = current_window - 2  # Keep last 2 windows
                keys_to_delete = [
                    key for key in _rate_limit_store.keys()
                    if int(key.split(":")[1]) < cleanup_cutoff
                ]
                for key in keys_to_delete:
                    del _rate_limit_store[key]
            
            return f(*args, **kwargs)
        return wrapper
    return decorator
