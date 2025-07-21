from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from typing import Optional, List, Dict, Any
from models.schemas import IPAnalysis, RiskLevel

class MongoDBManager:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        self.db = self.client[os.getenv('MONGODB_DB_NAME', 'ip_guardian')]
        self.analyses = self.db.ip_analyses
        self.analytics = self.db.analytics
        self.config = self.db.configuration

        # Create indexes for performance
        self.analyses.create_index([("ip_address", 1), ("timestamp", -1)])
        self.analyses.create_index([("website_domain", 1), ("timestamp", -1)])
        self.analytics.create_index([("date", -1), ("website_domain", 1)])

    def store_analysis(self, analysis: IPAnalysis, website_domain: str = "main") -> bool:
        """Store IP analysis in MongoDB"""
        try:
            doc = {
                "ip_address": analysis.ip_address,
                "should_block": analysis.should_block,
                "confidence_score": analysis.confidence_score,
                "risk_level": analysis.risk_level.value,
                "reasons": analysis.reasons,
                "analysis_details": analysis.analysis_details,
                "timestamp": analysis.timestamp,
                "website_domain": website_domain,
                "created_at": datetime.utcnow()
            }

            result = self.analyses.insert_one(doc)
            self._update_daily_analytics(website_domain, analysis)
            return bool(result.inserted_id)

        except Exception as e:
            print(f"MongoDB storage error: {e}")
            return False

    def get_recent_analysis(self, ip: str, hours: int = 24) -> Optional[IPAnalysis]:
        """Get recent analysis for IP within specified hours"""
        try:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            doc = self.analyses.find_one({
                "ip_address": ip,
                "timestamp": {"$gte": cutoff}
            }, sort=[("timestamp", -1)])

            if doc:
                return self._doc_to_analysis(doc)
            return None

        except Exception as e:
            print(f"MongoDB query error: {e}")
            return None

    def get_recent_threats(self, website_domain: str = "main", limit: int = 50) -> List[Dict]:
        """Get recent threats"""
        try:
            yesterday = datetime.utcnow() - timedelta(days=1)
            threats = list(self.analyses.find({
                "website_domain": website_domain,
                "timestamp": {"$gte": yesterday},
                "should_block": True
            }).sort("timestamp", -1).limit(limit))
            
            return [self._format_threat(threat) for threat in threats]
            
        except Exception as e:
            print(f"Error getting recent threats: {e}")
            return []

    def get_dashboard_stats(self, website_domain: str = "main") -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        try:
            now = datetime.utcnow()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            week_ago = today - timedelta(days=7)

            # Get today's stats
            today_analyses = list(self.analyses.find({
                "website_domain": website_domain,
                "timestamp": {"$gte": today}
            }))

            # Get yesterday's stats for comparison
            yesterday_analyses = list(self.analyses.find({
                "website_domain": website_domain,
                "timestamp": {"$gte": yesterday, "$lt": today}
            }))

            # Calculate stats
            total_requests = len(today_analyses)
            blocked_ips = len([a for a in today_analyses if a.get('should_block', False)])
            
            yesterday_requests = len(yesterday_analyses)
            growth_rate = ((total_requests - yesterday_requests) / max(yesterday_requests, 1)) * 100

            # Calculate average risk score
            risk_scores = [a.get('confidence_score', 0) for a in today_analyses]
            avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0

            # Active threats (high confidence blocks)
            active_threats = len([
                a for a in today_analyses 
                if a.get('should_block', False) and a.get('confidence_score', 0) > 0.7
            ])

            # Block rate
            block_rate = (blocked_ips / max(total_requests, 1)) * 100

            return {
                "total_requests": total_requests,
                "blocked_ips": blocked_ips,
                "avg_risk_score": avg_risk_score,
                "active_threats": active_threats,
                "block_rate": block_rate,
                "growth_rate": growth_rate,
                "generated_at": now
            }

        except Exception as e:
            print(f"Dashboard stats error: {e}")
            return {
                "total_requests": 0,
                "blocked_ips": 0,
                "avg_risk_score": 0.0,
                "active_threats": 0,
                "block_rate": 0.0,
                "growth_rate": 0.0
            }

    def _update_daily_analytics(self, website_domain: str, analysis: IPAnalysis):
        """Update daily analytics"""
        try:
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            self.analytics.update_one(
                {"website_domain": website_domain, "date": today},
                {
                    "$inc": {
                        "total_requests": 1,
                        "blocked_requests": 1 if analysis.should_block else 0
                    },
                    "$push": {
                        "risk_scores": analysis.confidence_score
                    }
                },
                upsert=True
            )
        except Exception as e:
            print(f"Analytics update error: {e}")

    def _doc_to_analysis(self, doc: Dict) -> IPAnalysis:
        """Convert MongoDB document to IPAnalysis"""
        return IPAnalysis(
            ip_address=doc['ip_address'],
            should_block=doc['should_block'],
            confidence_score=doc['confidence_score'],
            risk_level=RiskLevel(doc['risk_level']),
            reasons=doc['reasons'],
            analysis_details=doc['analysis_details'],
            timestamp=doc['timestamp']
        )

    def _format_threat(self, threat: Dict) -> Dict:
        """Format threat for display"""
        return {
            'ip_address': threat['ip_address'],
            'risk_level': threat['risk_level'],
            'confidence_score': threat['confidence_score'],
            'reasons': threat['reasons'],
            'timestamp': threat['timestamp']
        }

# Create global instance
mongo = MongoDBManager()
