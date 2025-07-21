import re
import ipaddress
from typing import Optional, Dict, Any

def validate_ip_address(ip: str) -> bool:
    """Validate if the provided string is a valid IP address"""
    if not ip or not isinstance(ip, str):
        return False
    
    try:
        ip_obj = ipaddress.ip_address(ip.strip())
        return True
    except (ValueError, AttributeError):
        return False

def sanitize_user_agent(user_agent: Optional[str]) -> str:
    """Sanitize user agent string to prevent injection attacks"""
    if not user_agent:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>&"\'`\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', str(user_agent))
    
    # Limit length to prevent oversized headers
    return sanitized[:1000]

def extract_client_ip(request) -> str:
    """Extract the real client IP from request headers"""
    # Check various proxy headers in order of preference
    possible_headers = [
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_CLIENT_IP',
        'REMOTE_ADDR'
    ]

    for header in possible_headers:
        ip = request.environ.get(header)
        if ip:
            # X-Forwarded-For can contain multiple IPs
            if ',' in ip:
                ip = ip.split(',').strip()
            
            if validate_ip_address(ip):
                return ip

    # Fallback to request.remote_addr
    return request.remote_addr or '127.0.0.1'

def normalize_log_data(log_data: Optional[str]) -> Optional[str]:
    """Normalize and clean log data for analysis"""
    if not log_data:
        return None

    # Limit size to prevent abuse
    if len(log_data) > 50000:  # 50KB limit
        log_data = log_data[:50000] + "... (truncated)"

    return log_data.strip()
