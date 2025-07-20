from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

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
class IPAnalysis:
    ip_address: str
    should_block: bool
    confidence_score: float  # 0.0 to 1.0
    risk_level: RiskLevel
    reasons: List[str]
    analysis_details: Dict[str, Any] = field(default_factory=dict)
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
