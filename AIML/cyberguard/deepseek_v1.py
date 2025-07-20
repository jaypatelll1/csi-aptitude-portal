import os
import re
import json
import heapq
import ipaddress
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import concurrent.futures
from openai import OpenAI

from flask import Flask, request, jsonify, render_template
from pydantic import BaseModel, Field

app = Flask(__name__)

# Configuration
# DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_KEY = "sk-1d899fa3b02149fdafcf498f370d51e4"
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY environment variable must be set")

# Initialize DeepSeek client
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url=DEEPSEEK_BASE_URL
)

# Precompiled datetime patterns
DATETIME_FORMATS = [
    '%d/%b/%Y:%H:%M:%S %z',  # With timezone
    '%d/%b/%Y:%H:%M:%S'      # Without timezone
]

@dataclass(slots=True)
class LogEntry:
    timestamp: datetime
    ip_address: str
    method: str
    endpoint: str
    status_code: int
    response_size: int
    user_agent: str
    referer: str
    raw_log: str

@dataclass(slots=True)
class IPAnalysis:
    ip_address: str
    should_block: bool
    confidence_score: float
    reasons: List[str]
    risk_level: str
    analysis_details: Dict[str, Any]

class AnalysisResult(BaseModel):
    should_block: bool = Field(description="Whether the IP should be blocked")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    risk_level: str = Field(description="Risk level: low, medium, high, or critical")
    reasons: List[str] = Field(description="List of reasons for the decision")
    analysis_details: Dict[str, Any] = Field(default_factory=dict, description="Additional analysis details")

class LogProcessor:
    def __init__(self):
        # Combined regex pattern for Apache and Nginx
        self.log_pattern = re.compile(
            r'(?P<ip>\d+\.\d+\.\d+\.\d+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+'
            r'"(?P<method>\w+)\s+(?P<endpoint>[^\s?]+)(?:\?[^"]*)?\s+[^"]*"\s+'
            r'(?P<status>\d+)\s+(?P<size>\d+|-)\s+"(?P<referer>[^"]*)"\s+'
            r'"(?P<user_agent>[^"]*)"'
        )
    
    def parse_log_line(self, line: str) -> Optional[LogEntry]:
        line = line.strip()
        if not line:
            return None
            
        match = self.log_pattern.match(line)
        if not match:
            return None
        
        data = match.groupdict()
        
        # Parse timestamp
        timestamp = None
        for fmt in DATETIME_FORMATS:
            try:
                timestamp = datetime.strptime(data['timestamp'], fmt)
                break
            except ValueError:
                continue
        
        if not timestamp:
            return None
        
        # Parse status code and size
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
        entries = []
        for line in log_content.split('\n'):
            if not line.strip():
                continue
            entry = self.parse_log_line(line)
            if entry:
                entries.append(entry)
        return entries

class IPBehaviorAnalyzer:
    def __init__(self):
        # Precompile all regex patterns
        self.suspicious_patterns = {
            'sql_injection': [re.compile(p, re.IGNORECASE) for p in [
                r'union\s+select', r'drop\s+table', r'or\s+1=1', r'script>', r'<script'
            ]],
            'xss': [re.compile(p, re.IGNORECASE) for p in [
                r'<script', r'javascript:', r'onerror=', r'onload='
            ]],
            'path_traversal': [re.compile(p, re.IGNORECASE) for p in [
                r'\.\./', r'\.\.\\', r'/etc/passwd', r'/windows/system32'
            ]],
            'command_injection': [re.compile(p, re.IGNORECASE) for p in [
                r';rm\s', r';cat\s', r'`cat\s', r'\|cat\s'
            ]],
            'brute_force_paths': [re.compile(p, re.IGNORECASE) for p in [
                r'/admin', r'/wp-admin', r'/phpmyadmin', r'/.env'
            ]]
        }
        
        # Geo cache to avoid repeated lookups
        self.geo_cache: Dict[str, Dict[str, str]] = {}
    
    def analyze_ip_behavior(self, ip_entries: List[LogEntry]) -> Dict[str, Any]:
        if not ip_entries:
            return {}
        
        # Calculate time span efficiently
        timestamps = [e.timestamp for e in ip_entries]
        min_time, max_time = min(timestamps), max(timestamps)
        time_span = (max_time - min_time).total_seconds() / 3600
        
        # Count status codes
        status_counter = defaultdict(int)
        for entry in ip_entries:
            status_counter[entry.status_code] += 1
        
        # Analyze endpoints
        endpoint_counter = defaultdict(int)
        for entry in ip_entries:
            endpoint_counter[entry.endpoint] += 1
        common_endpoints = dict(sorted(endpoint_counter.items(), key=lambda x: x[1], reverse=True)[:10])
        
        # Analyze user agents
        ua_counter = defaultdict(int)
        for entry in ip_entries:
            ua_counter[entry.user_agent] += 1
        common_agents = dict(sorted(ua_counter.items(), key=lambda x: x[1], reverse=True)[:5])
        
        return {
            'total_requests': len(ip_entries),
            'time_span': time_span,
            'request_rate': len(ip_entries) / time_span if time_span > 0 else len(ip_entries),
            'status_codes': dict(status_counter),
            'endpoints': {
                'unique_endpoints': len(endpoint_counter),
                'most_common': common_endpoints,
                'total_requests': len(ip_entries)
            },
            'user_agents': {
                'unique_agents': len(ua_counter),
                'most_common': common_agents
            },
            'suspicious_patterns': self._detect_suspicious_patterns(ip_entries),
            'geographic_info': self._get_basic_geo_info(ip_entries[0].ip_address)
        }
    
    def _detect_suspicious_patterns(self, entries: List[LogEntry]) -> Dict[str, List[str]]:
        detected = defaultdict(list)
        for entry in entries:
            full_request = f"{entry.endpoint} {entry.user_agent}".lower()
            for pattern_type, patterns in self.suspicious_patterns.items():
                for pattern in patterns:
                    if pattern.search(full_request):
                        detected[pattern_type].append(entry.endpoint)
                        break  # Only need one match per pattern type
        return dict(detected)
    
    def _get_basic_geo_info(self, ip: str) -> Dict[str, str]:
        # Check cache first
        if ip in self.geo_cache:
            return self.geo_cache[ip]
        
        try:
            ip_obj = ipaddress.ip_address(ip)
            geo_info = {
                'is_private': str(ip_obj.is_private),
                'is_multicast': str(ip_obj.is_multicast),
                'is_loopback': str(ip_obj.is_loopback)
            }
        except ValueError:
            geo_info = {'is_private': "False", 'is_multicast': "False", 'is_loopback': "False"}
        
        # Cache result
        self.geo_cache[ip] = geo_info
        return geo_info

class LogAnalysisAgent:
    def __init__(self):
        self.processor = LogProcessor()
        self.analyzer = IPBehaviorAnalyzer()
    
    def _create_analysis_prompt(self, ip_address: str, behavior_analysis: str, recent_entries: str) -> str:
        return f"""
You are a cybersecurity expert analyzing web server logs to determine if an IP address should be blocked.

IP Address: {ip_address}
Behavior Analysis:
{behavior_analysis}

Recent Log Entries (last 10):
{recent_entries}

Based on this data, analyze the IP's behavior and determine if it should be blocked. Consider:

1. Request Rate Analysis:
   - High request rates (>100 req/hour) may indicate automated attacks
   - Sustained high rates over time are more suspicious

2. HTTP Status Codes:
   - High numbers of 4xx errors may indicate scanning/probing
   - Patterns of 401/403 may indicate brute force attempts

3. Endpoint Patterns:
   - Requests to admin panels, config files, or sensitive paths
   - Directory traversal attempts or file inclusion attacks

4. Attack Signatures:
   - SQL injection attempts in parameters
   - XSS payloads in requests
   - Command injection patterns

5. User Agent Analysis:
   - Suspicious or automated user agents
   - Rapidly changing user agents from same IP

6. Geographic and Network Factors:
   - Known malicious IP ranges
   - Tor exit nodes or proxy services

Think through your analysis step by step, then provide your final decision in the following JSON format:
{{
    "should_block": true/false,
    "confidence_score": 0.0-1.0,
    "risk_level": "low/medium/high/critical",
    "reasons": ["reason1", "reason2", ...],
    "analysis_details": {{
        "primary_threats": ["threat_type1", "threat_type2"],
        "attack_indicators": ["indicator1", "indicator2"],
        "behavioral_score": 0-100,
        "recommendation": "detailed recommendation"
    }}
}}

Be extremely careful with blocking decisions as false positives can impact legitimate users.
Only recommend blocking for high-confidence malicious behavior.
"""
    
    def _parse_deepseek_response(self, response_text: str) -> Dict[str, Any]:
        """Parse DeepSeek Reasoner response and extract JSON analysis"""
        try:
            # DeepSeek Reasoner returns reasoning in <think> tags followed by final answer
            # Look for JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                parsed_data = json.loads(json_match.group())
                return self._validate_parsed_data(parsed_data)
            return self._fallback_parse(response_text)
        except Exception as e:
            print(f"Error parsing DeepSeek response: {e}")
            return self._fallback_parse(response_text)
    
    def _validate_parsed_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean parsed data"""
        return {
            "should_block": bool(data.get("should_block", False)),
            "confidence_score": max(0.0, min(1.0, float(data.get("confidence_score", 0.5)))),
            "risk_level": data.get("risk_level", "medium").lower(),
            "reasons": data.get("reasons", ["Analysis completed"]),
            "analysis_details": data.get("analysis_details", {})
        }
    
    def _fallback_parse(self, text: str) -> Dict[str, Any]:
        """Fallback parsing when JSON extraction fails"""
        should_block = any(keyword in text.lower() for keyword in 
                          ['block', 'malicious', 'attack', 'threat', 'suspicious'])
        return {
            "should_block": should_block,
            "confidence_score": 0.5,
            "risk_level": "medium" if should_block else "low",
            "reasons": ["Fallback analysis - manual review recommended"],
            "analysis_details": {"parsing_method": "fallback"}
        }
    
    def analyze_ip(self, ip_address: str, ip_entries: List[LogEntry]) -> IPAnalysis:
        if not ip_entries:
            return IPAnalysis(
                ip_address=ip_address,
                should_block=False,
                confidence_score=0.0,
                reasons=["No log entries found for this IP"],
                risk_level="unknown",
                analysis_details={}
            )
        
        # Analyze IP behavior
        behavior_analysis = self.analyzer.analyze_ip_behavior(ip_entries)
        
        # Get recent entries efficiently
        recent_entries = heapq.nlargest(10, ip_entries, key=lambda x: x.timestamp)
        recent_entries_text = "\n".join(
            f"{e.timestamp} {e.method} {e.endpoint} {e.status_code}" for e in recent_entries
        )
        
        # Create prompt for DeepSeek
        prompt = self._create_analysis_prompt(
            ip_address,
            json.dumps(behavior_analysis, default=str),
            recent_entries_text
        )
        
        # Run DeepSeek analysis
        try:
            response = client.chat.completions.create(
                # model="deepseek-reasoner",
                model="deepseek-chat",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=2000
            )
            
            response_text = response.choices[0].message.content
            result = self._parse_deepseek_response(response_text or "")
            
            return IPAnalysis(
                ip_address=ip_address,
                should_block=result.get('should_block', False),
                confidence_score=result.get('confidence_score', 0.5),
                reasons=result.get('reasons', []),
                risk_level=result.get('risk_level', 'medium'),
                analysis_details=result.get('analysis_details', {})
            )
        except Exception as e:
            print(f"DeepSeek API error: {e}")
            return self._fallback_analysis(ip_address, behavior_analysis)
    
    def _fallback_analysis(self, ip_address: str, behavior_analysis: Dict) -> IPAnalysis:
        """Fallback analysis when DeepSeek API fails"""
        should_block = False
        reasons = []
        risk_level = "low"
        
        request_rate = behavior_analysis.get('request_rate', 0)
        suspicious_patterns = behavior_analysis.get('suspicious_patterns', {})
        status_codes = behavior_analysis.get('status_codes', {})
        
        if request_rate > 500:
            should_block = True
            reasons.append("Extremely high request rate detected")
            risk_level = "high"
        elif len(suspicious_patterns) > 3:
            should_block = True
            reasons.append("Multiple attack patterns detected")
            risk_level = "high"
        elif int(status_codes.get('404', 0)) > 100:
            should_block = True
            reasons.append("Excessive 404 errors - possible scanning")
            risk_level = "medium"
        
        return IPAnalysis(
            ip_address=ip_address,
            should_block=should_block,
            confidence_score=0.7 if should_block else 0.3,
            reasons=reasons or ["Automated rule-based analysis"],
            risk_level=risk_level,
            analysis_details={"analysis_method": "fallback", "behavior_data": behavior_analysis}
        )

# Initialize the agent
agent = LogAnalysisAgent()

def analyze_ip_batch(ip_entries_map: Dict[str, List[LogEntry]]) -> List[Dict[str, Any]]:
    """Process IPs in parallel batches"""
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(agent.analyze_ip, ip, entries): ip
            for ip, entries in ip_entries_map.items()
        }
        for future in concurrent.futures.as_completed(futures):
            try:
                analysis = future.result()
                results.append({
                    'ip': analysis.ip_address,
                    'should_block': analysis.should_block,
                    'confidence_score': analysis.confidence_score,
                    'risk_level': analysis.risk_level,
                    'reasons': analysis.reasons,
                    'analysis_details': analysis.analysis_details
                })
            except Exception as e:
                print(f"Error processing IP analysis: {e}")
                continue
    return results

@app.route('/analyze_logs', methods=['POST'])
def analyze_logs():
    try:
        data = request.json
        if not data or 'logs' not in data:
            return jsonify({'error': 'No logs provided'}), 400
        
        log_content = data['logs']
        log_entries = agent.processor.process_logs(log_content)
        
        if not log_entries:
            return jsonify({'error': 'No valid log entries found'}), 400
        
        # Group entries by IP efficiently
        ip_entries_map = defaultdict(list)
        for entry in log_entries:
            ip_entries_map[entry.ip_address].append(entry)
        
        # Analyze IPs in parallel
        results = analyze_ip_batch(ip_entries_map)
        
        # Sort by risk level and confidence
        risk_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'unknown': 0}
        results.sort(key=lambda x: (risk_order.get(x['risk_level'], 0), x['confidence_score']), reverse=True)
        
        blocked_count = sum(1 for r in results if r['should_block'])
        
        return jsonify({
            'status': 'success',
            'total_ips_analyzed': len(results),
            'total_log_entries': len(log_entries),
            'blocked_ips': blocked_count,
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/analyze_single_ip', methods=['POST'])
def analyze_single_ip():
    try:
        data = request.json
        if not data or 'ip' not in data or 'logs' not in data:
            return jsonify({'error': 'IP address and logs required'}), 400
        
        ip_address = data['ip']
        log_content = data['logs']
        
        log_entries = agent.processor.process_logs(log_content)
        ip_entries = [entry for entry in log_entries if entry.ip_address == ip_address]
        
        analysis = agent.analyze_ip(ip_address, ip_entries)
        
        return jsonify({
            'status': 'success',
            'ip': analysis.ip_address,
            'should_block': analysis.should_block,
            'confidence_score': analysis.confidence_score,
            'risk_level': analysis.risk_level,
            'reasons': analysis.reasons,
            'analysis_details': analysis.analysis_details,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
    
@app.route('/', methods=['GET'])
def home():
    return render_template('Home2.html')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Log Analysis Agent with DeepSeek Reasoner',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("Starting Log Analysis Agent with DeepSeek Reasoner...")
    app.run(host='0.0.0.0', port=5000, threaded=True)