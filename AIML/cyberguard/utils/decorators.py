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
            # There's already a running loop, run in thread pool
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, f(*args, **kwargs))
                return future.result()
    return wrapper

def rate_limit(max_requests: int = None, window_seconds: int = 60):
    """Decorator to implement rate limiting"""
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Use config value if not specified
            max_reqs = max_requests or config.RATE_LIMIT_PER_MINUTE
            
            # Get client IP
            client_ip = (
                request.headers.get('X-Forwarded-For', '').split(',')[0].strip() or
                request.headers.get('X-Real-IP') or
                request.environ.get('HTTP_X_REAL_IP') or
                request.remote_addr or
                '127.0.0.1'
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
                cleanup_cutoff = current_window - 2
                keys_to_delete = [
                    key for key in _rate_limit_store.keys()
                    if int(key.split(":")[1]) < cleanup_cutoff
                ]
                for key in keys_to_delete:
                    del _rate_limit_store[key]
            
            return f(*args, **kwargs)
        return wrapper
    return decorator
