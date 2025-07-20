import time
import threading
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = threading.Lock()
    
    def is_allowed(self, identifier):
        with self.lock:
            now = time.time()
            # Clean old requests
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if now - req_time < self.window_seconds
            ]
            
            if len(self.requests[identifier]) < self.max_requests:
                self.requests[identifier].append(now)
                return True
            return False
