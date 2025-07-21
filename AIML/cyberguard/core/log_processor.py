import re
import ipaddress
from datetime import datetime
from collections import defaultdict, Counter
from typing import Dict, List, Any, Optional
from models.schemas import LogEntry, BehavioralMetrics, ThreatType

class AdvancedLogProcessor:
    def __init__(self):
        # Precompiled regex patterns
        self.log_pattern = re.compile(
            r'(?P<ip>\d+\.\d+\.\d+\.\d+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+'
            r'"(?P<method>\w+)\s+(?P<endpoint>[^\s?]+)(?:\?[^"]*)?\s+[^"]*"\s+'
            r'(?P<status>\d+)\s+(?P<size>\d+|-)\s+"(?P<referer>[^"]*)"\s+'
            r'"(?P<user_agent>[^"]*)"'
        )
        
        # Suspicious patterns
        self.suspicious_patterns = {
            'sql_injection': [re.compile(p, re.IGNORECASE) for p in [
                r'union\s+select', r'drop\s+table', r'or\s+1=1', r'script>',
                r'<script', r'\'\s+or\s+\'', r'admin\'\s*--', r'waitfor\s+delay'
            ]],
            'xss': [re.compile(p, re.IGNORECASE) for p in [
                r'<script>', r'javascript:', r'onerror=', r'onload=',
                r'<iframe', r'alert\(', r'document\.cookie'
            ]],
            'directory_traversal': [re.compile(p, re.IGNORECASE) for p in [
                r'\.\./', r'\.\.\\', r'%2e%2e%2f', r'%2e%2e\\',
                r'/etc/passwd', r'/etc/shadow', r'boot\.ini'
            ]],
            'command_injection': [re.compile(p, re.IGNORECASE) for p in [
                r';\s*cat\s+', r';\s*ls\s+', r';\s*id\s*;', r'`.*`',
                r'\$\(.*\)', r'&&\s*cat\s+', r'\|\s*cat\s+'
            ]],
            'malicious_bots': [re.compile(p, re.IGNORECASE) for p in [
                r'sqlmap', r'nikto', r'nessus', r'acunetix', r'masscan',
                r'zap', r'burp', r'w3af', r'skipfish'
            ]]
        }
        
        # Datetime formats
        self.datetime_formats = [
            '%d/%b/%Y:%H:%M:%S %z',
            '%d/%b/%Y:%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d %H:%M:%S'
        ]

    def parse_log_line(self, line: str) -> Optional[LogEntry]:
        """Parse a single log line into LogEntry"""
        line = line.strip()
        if not line:
            return None

        match = self.log_pattern.match(line)
        if not match:
            return None

        data = match.groupdict()

        # Parse timestamp
        timestamp = None
        for fmt in self.datetime_formats:
            try:
                timestamp = datetime.strptime(data['timestamp'], fmt)
                break
            except ValueError:
                continue

        if not timestamp:
            return None

        # Parse numeric fields
        try:
            status_code = int(data['status'])
            response_size = int(data['size']) if data['size'] != '-' else 0
        except ValueError:
            return None

        return LogEntry(
            timestamp=timestamp,
            ip_address=data['ip'],
            method=data['method'],
            endpoint=data['endpoint'],
            status_code=status_code,
            response_size=response_size,
            user_agent=data['user_agent'],
            referer=data['referer'],
            raw_log=line
        )

    def process_logs(self, log_content: str) -> List[LogEntry]:
        """Process multiple log lines"""
        entries = []
        for line in log_content.split('\n'):
            if not line.strip():
                continue
            entry = self.parse_log_line(line)
            if entry:
                entries.append(entry)
        return entries

    def analyze_ip_behavior(self, entries: List[LogEntry], target_ip: str) -> BehavioralMetrics:
        """Analyze behavioral patterns for a specific IP"""
        ip_entries = [e for e in entries if e.ip_address == target_ip]
        
        if not ip_entries:
            return BehavioralMetrics(
                request_frequency=0.0,
                error_rate=0.0,
                unique_endpoints=0,
                suspicious_patterns=[],
                time_distribution={},
                status_code_distribution={},
                endpoint_diversity_score=0.0,
                user_agent_consistency=0.0
            )

        # Calculate metrics
        total_requests = len(ip_entries)
        error_requests = len([e for e in ip_entries if e.status_code >= 400])
        error_rate = error_requests / total_requests if total_requests > 0 else 0

        # Time-based analysis
        time_distribution = defaultdict(int)
        for entry in ip_entries:
            hour = entry.timestamp.hour
            time_distribution[str(hour)] += 1

        # Status code distribution
        status_codes = Counter(e.status_code for e in ip_entries)
        status_code_distribution = dict(status_codes)

        # Endpoint analysis
        endpoints = [e.endpoint for e in ip_entries]
        unique_endpoints = len(set(endpoints))
        endpoint_diversity_score = unique_endpoints / total_requests if total_requests > 0 else 0

        # User agent consistency
        user_agents = [e.user_agent for e in ip_entries]
        unique_user_agents = len(set(user_agents))
        user_agent_consistency = 1.0 - (unique_user_agents / total_requests) if total_requests > 0 else 0

        # Detect suspicious patterns
        suspicious_patterns = self._detect_suspicious_patterns(ip_entries)

        # Calculate request frequency (requests per minute)
        if len(ip_entries) > 1:
            time_span = (ip_entries[-1].timestamp - ip_entries[0].timestamp).total_seconds() / 60
            request_frequency = total_requests / max(time_span, 1)
        else:
            request_frequency = 1.0

        return BehavioralMetrics(
            request_frequency=request_frequency,
            error_rate=error_rate,
            unique_endpoints=unique_endpoints,
            suspicious_patterns=suspicious_patterns,
            time_distribution=dict(time_distribution),
            status_code_distribution=status_code_distribution,
            endpoint_diversity_score=endpoint_diversity_score,
            user_agent_consistency=user_agent_consistency
        )

    def _detect_suspicious_patterns(self, entries: List[LogEntry]) -> List[str]:
        """Detect suspicious patterns in log entries"""
        detected_patterns = []
        
        for entry in entries:
            # Check endpoint for suspicious patterns
            endpoint = entry.endpoint
            user_agent = entry.user_agent
            
            for pattern_type, patterns in self.suspicious_patterns.items():
                for pattern in patterns:
                    if pattern.search(endpoint) or pattern.search(user_agent):
                        if pattern_type not in detected_patterns:
                            detected_patterns.append(pattern_type)
        
        return detected_patterns

    def classify_threat_types(self, metrics: BehavioralMetrics, entries: List[LogEntry]) -> List[ThreatType]:
        """Classify potential threat types based on behavioral metrics"""
        threat_types = []
        
        # High request frequency indicates potential DDoS or brute force
        if metrics.request_frequency > 10:  # More than 10 requests per minute
            if metrics.error_rate > 0.5:  # High error rate suggests brute force
                threat_types.append(ThreatType.BRUTE_FORCE)
            else:
                threat_types.append(ThreatType.DDoS)
        
        # Check for injection patterns
        if 'sql_injection' in metrics.suspicious_patterns:
            threat_types.append(ThreatType.SQL_INJECTION)
        
        if 'xss' in metrics.suspicious_patterns:
            threat_types.append(ThreatType.XSS)
        
        # Bot detection
        if 'malicious_bots' in metrics.suspicious_patterns:
            threat_types.append(ThreatType.BOT_TRAFFIC)
        
        # Scanning behavior
        if metrics.endpoint_diversity_score > 0.8 and metrics.error_rate > 0.7:
            threat_types.append(ThreatType.SCANNING)
        
        # Low user agent consistency suggests bot behavior
        if metrics.user_agent_consistency < 0.3 and metrics.request_frequency > 5:
            threat_types.append(ThreatType.MALICIOUS_CRAWLING)
        
        return threat_types if threat_types else [ThreatType.UNKNOWN]
