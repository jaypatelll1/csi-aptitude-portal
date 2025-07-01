import threading
import time
class AdvancedCache:
    def __init__(self, max_size=1000, ttl_seconds=3600):
        self.cache = {}
        self.access_times = {}
        self.creation_times = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                # Check TTL
                if time.time() - self.creation_times[key] > self.ttl_seconds:
                    self._remove(key)
                    return None
                self.access_times[key] = time.time()
                return self.cache[key]
            return None
    
    def set(self, key, value):
        with self.lock:
            if len(self.cache) >= self.max_size:
                self._evict_lru()
            
            self.cache[key] = value
            self.access_times[key] = time.time()
            self.creation_times[key] = time.time()
    
    def _remove(self, key):
        if key in self.cache:
            del self.cache[key]
            del self.access_times[key]
            del self.creation_times[key]
    
    def _evict_lru(self):
        if not self.cache:
            return
        lru_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
        self._remove(lru_key)
