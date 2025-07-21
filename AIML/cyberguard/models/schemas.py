from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatType(Enum):
    BRUTE_FORCE = "brute_force"
    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    SCANNING = "scanning"
    DDoS = "ddos"
    BOT_TRAFFIC = "bot_traffic"
    MALICIOUS_CRAWLING = "malicious_crawling"
    UNKNOWN = "unknown"

@dataclass
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

@dataclass
class BehavioralMetrics:
    request_frequency: float
    error_rate: float
    unique_endpoints: int
    suspicious_patterns: List[str]
    time_distribution: Dict[str, int]
    status_code_distribution: Dict[int, int]
    endpoint_diversity_score: float
    user_agent_consistency: float

@dataclass
class IPAnalysis:
    ip_address: str
    should_block: bool
    confidence_score: float # 0.0 to 1.0
    risk_level: RiskLevel
    threat_types: List[ThreatType] = field(default_factory=list)
    reasons: List[str] = field(default_factory=list)
    behavioral_metrics: Optional[BehavioralMetrics] = None
    analysis_details: Dict[str, Any] = field(default_factory=dict)
    analysis_engine: str = "unknown"
    timestamp: datetime = field(default_factory=datetime.utcnow)

@dataclass
class APIRequest:
    ip: str
    log_data: Optional[str] = None
    user_agent: Optional[str] = None
    additional_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class APIResponse:
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
