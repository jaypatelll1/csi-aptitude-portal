import threading
import time
import heapq
from collections import OrderedDict
from typing import Any, Optional, Dict, Callable, Union
import logging
from dataclasses import dataclass
from enum import Enum

class EvictionPolicy(Enum):
    LRU = "lru"
    LFU = "lfu"
    FIFO = "fifo"

@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    evictions: int = 0
    expired: int = 0
    
    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

class AdvancedCache:
    def __init__(self, 
                 max_size: int = 1000, 
                 ttl_seconds: Union[int, float] = 3600,
                 eviction_policy: EvictionPolicy = EvictionPolicy.LRU,
                 enable_stats: bool = True,
                 cleanup_interval: int = 300):
        """
        Enhanced cache with multiple eviction policies and comprehensive features.
        
        Args:
            max_size: Maximum number of items in cache
            ttl_seconds: Time-to-live for cache entries in seconds
            eviction_policy: Policy for evicting items when cache is full
            enable_stats: Whether to track cache statistics
            cleanup_interval: Interval in seconds for automatic cleanup of expired items
        """
        self.cache = OrderedDict() if eviction_policy == EvictionPolicy.LRU else {}
        self.access_times = {}
        self.creation_times = {}
        self.access_counts = {}  # For LFU policy
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.eviction_policy = eviction_policy
        self.enable_stats = enable_stats
        self.cleanup_interval = cleanup_interval
        
        # Thread safety
        self.lock = threading.RLock()
        
        # Statistics
        self.stats = CacheStats() if enable_stats else None
        
        # Cleanup thread
        self._cleanup_thread = None
        self._stop_cleanup = threading.Event()
        
        # Start cleanup thread if interval > 0
        if cleanup_interval > 0:
            self._start_cleanup_thread()
    
    def get(self, key: Any, default: Any = None) -> Any:
        """Get an item from the cache."""
        with self.lock:
            if key in self.cache:
                # Check TTL
                if self._is_expired(key):
                    self._remove(key)
                    if self.enable_stats:
                        self.stats.expired += 1
                        self.stats.misses += 1
                    return default
                
                # Update access info
                self._update_access_info(key)
                
                if self.enable_stats:
                    self.stats.hits += 1
                
                return self.cache[key]
            
            if self.enable_stats:
                self.stats.misses += 1
            
            return default
    
    def set(self, key: Any, value: Any, ttl: Optional[Union[int, float]] = None) -> None:
        """Set an item in the cache with optional custom TTL."""
        with self.lock:
            current_time = time.time()
            
            # If key already exists, update it
            if key in self.cache:
                self.cache[key] = value
                self.access_times[key] = current_time
                self.creation_times[key] = current_time
                if key in self.access_counts:
                    self.access_counts[key] += 1
                return
            
            # Check if we need to evict
            if len(self.cache) >= self.max_size:
                self._evict()
            
            # Add new item
            self.cache[key] = value
            self.access_times[key] = current_time
            self.creation_times[key] = current_time
            self.access_counts[key] = 1
            
            # For LRU with OrderedDict, move to end
            if self.eviction_policy == EvictionPolicy.LRU and isinstance(self.cache, OrderedDict):
                self.cache.move_to_end(key)
    
    def delete(self, key: Any) -> bool:
        """Delete an item from the cache."""
        with self.lock:
            if key in self.cache:
                self._remove(key)
                return True
            return False
    
    def clear(self) -> None:
        """Clear all items from the cache."""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()
            self.creation_times.clear()
            self.access_counts.clear()
    
    def size(self) -> int:
        """Get the current size of the cache."""
        with self.lock:
            return len(self.cache)
    
    def keys(self) -> list:
        """Get all keys in the cache."""
        with self.lock:
            return list(self.cache.keys())
    
    def items(self) -> list:
        """Get all items in the cache."""
        with self.lock:
            return list(self.cache.items())
    
    def get_stats(self) -> Optional[CacheStats]:
        """Get cache statistics."""
        return self.stats
    
    def reset_stats(self) -> None:
        """Reset cache statistics."""
        if self.enable_stats:
            self.stats = CacheStats()
    
    def cleanup_expired(self) -> int:
        """Manually clean up expired items. Returns number of items removed."""
        with self.lock:
            expired_keys = []
            current_time = time.time()
            
            for key in list(self.cache.keys()):
                if current_time - self.creation_times[key] > self.ttl_seconds:
                    expired_keys.append(key)
            
            for key in expired_keys:
                self._remove(key)
                if self.enable_stats:
                    self.stats.expired += 1
            
            return len(expired_keys)
    
    def set_ttl(self, key: Any, ttl_seconds: Union[int, float]) -> bool:
        """Set a new TTL for an existing key."""
        with self.lock:
            if key in self.cache:
                self.creation_times[key] = time.time() - (self.ttl_seconds - ttl_seconds)
                return True
            return False
    
    def get_ttl(self, key: Any) -> Optional[float]:
        """Get the remaining TTL for a key."""
        with self.lock:
            if key in self.cache:
                elapsed = time.time() - self.creation_times[key]
                remaining = self.ttl_seconds - elapsed
                return max(0, remaining)
            return None
    
    def exists(self, key: Any) -> bool:
        """Check if a key exists and is not expired."""
        with self.lock:
            if key in self.cache:
                return not self._is_expired(key)
            return False
    
    def _is_expired(self, key: Any) -> bool:
        """Check if a key is expired."""
        return time.time() - self.creation_times[key] > self.ttl_seconds
    
    def _update_access_info(self, key: Any) -> None:
        """Update access information for a key."""
        current_time = time.time()
        self.access_times[key] = current_time
        self.access_counts[key] = self.access_counts.get(key, 0) + 1
        
        # For LRU with OrderedDict, move to end
        if self.eviction_policy == EvictionPolicy.LRU and isinstance(self.cache, OrderedDict):
            self.cache.move_to_end(key)
    
    def _evict(self) -> None:
        """Evict an item based on the eviction policy."""
        if not self.cache:
            return
        
        key_to_evict = None
        
        if self.eviction_policy == EvictionPolicy.LRU:
            if isinstance(self.cache, OrderedDict):
                key_to_evict = next(iter(self.cache))
            else:
                key_to_evict = min(self.access_times.keys(), key=lambda k: self.access_times[k])
        
        elif self.eviction_policy == EvictionPolicy.LFU:
            # Find key with lowest access count, break ties with oldest access time
            key_to_evict = min(self.access_counts.keys(), 
                             key=lambda k: (self.access_counts[k], self.access_times[k]))
        
        elif self.eviction_policy == EvictionPolicy.FIFO:
            key_to_evict = min(self.creation_times.keys(), key=lambda k: self.creation_times[k])
        
        if key_to_evict:
            self._remove(key_to_evict)
            if self.enable_stats:
                self.stats.evictions += 1
    
    def _remove(self, key: Any) -> None:
        """Remove a key from all tracking structures."""
        if key in self.cache:
            del self.cache[key]
            self.access_times.pop(key, None)
            self.creation_times.pop(key, None)
            self.access_counts.pop(key, None)
    
    def _start_cleanup_thread(self) -> None:
        """Start the background cleanup thread."""
        def cleanup_worker():
            while not self._stop_cleanup.wait(self.cleanup_interval):
                try:
                    self.cleanup_expired()
                except Exception as e:
                    logging.error(f"Error during cache cleanup: {e}")
        
        self._cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        self._cleanup_thread.start()
    
    def shutdown(self) -> None:
        """Shutdown the cache and cleanup thread."""
        if self._cleanup_thread:
            self._stop_cleanup.set()
            self._cleanup_thread.join(timeout=1)
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.shutdown()
    
    def __len__(self) -> int:
        """Get the length of the cache."""
        return self.size()
    
    def __contains__(self, key: Any) -> bool:
        """Check if key is in cache."""
        return self.exists(key)
    
    def __repr__(self) -> str:
        """String representation of the cache."""
        return (f"AdvancedCache(size={len(self.cache)}, max_size={self.max_size}, "
                f"ttl={self.ttl_seconds}, policy={self.eviction_policy.value})")


# Example usage and demonstration
if __name__ == "__main__":
    # Create cache with LRU eviction
    cache = AdvancedCache(max_size=100, ttl_seconds=60, eviction_policy=EvictionPolicy.LRU)
    
    # Basic operations
    cache.set("key1", "value1")
    cache.set("key2", "value2")
    
    print(f"key1: {cache.get('key1')}")
    print(f"key2: {cache.get('key2')}")
    print(f"key3: {cache.get('key3', 'default')}")
    
    # Check statistics
    if cache.get_stats():
        stats = cache.get_stats()
        print(f"Cache stats - Hits: {stats.hits}, Misses: {stats.misses}, Hit rate: {stats.hit_rate:.2%}")
    
    # Clean shutdown
    cache.shutdown()