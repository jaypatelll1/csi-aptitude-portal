import json
import time
from typing import Optional, Dict, Any
from models.schemas import IPAnalysis, RiskLevel
from datetime import datetime

class CacheEntry:
    def __init__(self, value: Dict[str, Any], expire_at: float):
        self.value = value
        self.expire_at = expire_at
        self.created_at = time.time()

class SimpleCacheManager:
    def __init__(self, cache_ttl: int = 3600, max_entries: int = 1000):
        self._cache: Dict[str, CacheEntry] = {}
        self.cache_ttl = cache_ttl
        self.max_entries = max_entries
        self._last_cleanup = time.time()

    def _generate_cache_key(self, ip: str, context_hash: str = "") -> str:
        """Generate a cache key for the given IP and context"""
        base_key = f"ip_analysis:{ip}"
        if context_hash:
            base_key += f":{context_hash}"
        return base_key

    def _cleanup_expired(self):
        """Remove expired entries from cache"""
        current_time = time.time()
        
        # Only cleanup every 5 minutes to avoid performance impact
        if current_time - self._last_cleanup < 300:  # 5 minutes
            return

        expired_keys = []
        for key, entry in self._cache.items():
            if entry.expire_at <= current_time:
                expired_keys.append(key)

        for key in expired_keys:
            del self._cache[key]

        self._last_cleanup = current_time

        # If still too many entries, remove oldest ones
        if len(self._cache) > self.max_entries:
            sorted_entries = sorted(
                self._cache.items(),
                key=lambda x: x[1].created_at
            )
            
            entries_to_remove = len(self._cache) - self.max_entries
            for i in range(entries_to_remove):
                key = sorted_entries[i][0]
                del self._cache[key]

    def get_analysis(self, ip: str, context_hash: str = "") -> Optional[IPAnalysis]:
        """Retrieve cached analysis for an IP"""
        try:
            cache_key = self._generate_cache_key(ip, context_hash)
            entry = self._cache.get(cache_key)
            
            if not entry:
                return None

            # Check if expired
            if entry.expire_at <= time.time():
                del self._cache[cache_key]
                return None

            # Convert cached data back to IPAnalysis object
            data = entry.value
            return IPAnalysis(
                ip_address=data['ip_address'],
                should_block=data['should_block'],
                confidence_score=data['confidence_score'],
                risk_level=RiskLevel(data['risk_level']),
                reasons=data['reasons'],
                analysis_details=data['analysis_details'],
                timestamp=datetime.fromisoformat(data['timestamp'])
            )

        except (KeyError, ValueError, TypeError) as e:
            # Remove corrupted cache entry
            cache_key = self._generate_cache_key(ip, context_hash)
            if cache_key in self._cache:
                del self._cache[cache_key]
            return None

    def store_analysis(self, analysis: IPAnalysis, context_hash: str = "", ttl: int = None) -> bool:
        """Store analysis result in cache"""
        try:
            cache_key = self._generate_cache_key(analysis.ip_address, context_hash)
            cache_ttl = ttl or self.cache_ttl

            # Convert IPAnalysis to serializable format
            data = {
                'ip_address': analysis.ip_address,
                'should_block': analysis.should_block,
                'confidence_score': analysis.confidence_score,
                'risk_level': analysis.risk_level.value,
                'reasons': analysis.reasons,
                'analysis_details': analysis.analysis_details,
                'timestamp': analysis.timestamp.isoformat()
            }

            # Store in cache
            expire_at = time.time() + cache_ttl
            self._cache[cache_key] = CacheEntry(data, expire_at)

            # Cleanup old entries if needed
            self._cleanup_expired()
            return True

        except Exception as e:
            print(f"Cache storage error: {e}")
            return False

    def invalidate_ip(self, ip: str) -> bool:
        """Invalidate all cached entries for a specific IP"""
        try:
            prefix = f"ip_analysis:{ip}"
            keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
            
            for key in keys_to_delete:
                del self._cache[key]
            return True
            
        except Exception as e:
            print(f"Cache invalidation error: {e}")
            return False

    def clear_all(self) -> bool:
        """Clear all cached entries"""
        try:
            self._cache.clear()
            return True
        except Exception:
            return False

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        current_time = time.time()
        total_entries = len(self._cache)
        expired_entries = sum(
            1 for entry in self._cache.values()
            if entry.expire_at <= current_time
        )

        return {
            'total_entries': total_entries,
            'active_entries': total_entries - expired_entries,
            'expired_entries': expired_entries,
            'max_entries': self.max_entries,
            'cache_ttl_seconds': self.cache_ttl
        }
