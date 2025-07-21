import json
import re
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime

from groq import Groq
from openai import OpenAI

from config.setting import config
from models.schemas import IPAnalysis, RiskLevel, ThreatType, BehavioralMetrics
from core.log_processor import AdvancedLogProcessor

class EnhancedAnalysisClient:
    def __init__(self):
        self.log_processor = AdvancedLogProcessor()
        
        # Initialize API clients
        self.groq_client = None
        self.deepseek_client = None
        
        if config.GROQ_API_KEY:
            self.groq_client = Groq(api_key=config.GROQ_API_KEY)
        
        if config.DEEPSEEK_API_KEY:
            self.deepseek_client = OpenAI(
                api_key=config.DEEPSEEK_API_KEY,
                base_url=config.DEEPSEEK_BASE_URL
            )
    
    async def analyze_ip(
        self,
        ip: str,
        log_data: Optional[str] = None,
        context: Dict[str, Any] = None,
        user_agent: Optional[str] = None
    ) -> IPAnalysis:
        """Enhanced IP analysis using multiple engines"""
        
        # Step 1: Behavioral analysis if log data is provided
        behavioral_metrics = None
        threat_types = []
        
        if log_data and config.ENABLE_BEHAVIORAL_ANALYSIS:
            log_entries = self.log_processor.process_logs(log_data)
            if log_entries:
                behavioral_metrics = self.log_processor.analyze_ip_behavior(log_entries, ip)
                threat_types = self.log_processor.classify_threat_types(behavioral_metrics, log_entries)
        
        # Step 2: AI-powered analysis
        ai_analysis = await self._get_ai_analysis(ip, log_data, context, user_agent, behavioral_metrics)
        
        # Step 3: Combine analyses
        final_analysis = self._combine_analyses(ip, ai_analysis, behavioral_metrics, threat_types)
        
        return final_analysis
    
    async def _get_ai_analysis(
        self,
        ip: str,
        log_data: Optional[str],
        context: Dict[str, Any],
        user_agent: Optional[str],
        behavioral_metrics: Optional[BehavioralMetrics]
    ) -> IPAnalysis:
        """Get AI analysis based on configured engine"""
        
        if config.ANALYSIS_ENGINE == 'hybrid':
            # Try both engines and combine results
            results = []
            
            if self.groq_client:
                try:
                    groq_result = await self._analyze_with_groq(ip, log_data, context, user_agent, behavioral_metrics)
                    results.append(groq_result)
                except Exception as e:
                    print(f"Groq analysis failed: {e}")
            
            if self.deepseek_client:
                try:
                    deepseek_result = await self._analyze_with_deepseek(ip, log_data, context, user_agent, behavioral_metrics)
                    results.append(deepseek_result)
                except Exception as e:
                    print(f"DeepSeek analysis failed: {e}")
            
            if results:
                return self._merge_ai_results(results)
            else:
                return self._create_fallback_analysis(ip)
        
        elif config.ANALYSIS_ENGINE == 'groq' and self.groq_client:
            return await self._analyze_with_groq(ip, log_data, context, user_agent, behavioral_metrics)
        
        elif config.ANALYSIS_ENGINE == 'deepseek' and self.deepseek_client:
            return await self._analyze_with_deepseek(ip, log_data, context, user_agent, behavioral_metrics)
        
        else:
            return self._create_fallback_analysis(ip)
    
    async def _analyze_with_groq(
        self,
        ip: str,
        log_data: Optional[str],
        context: Dict[str, Any],
        user_agent: Optional[str],
        behavioral_metrics: Optional[BehavioralMetrics]
    ) -> IPAnalysis:
        """Analyze using Groq API"""
        
        prompt = self._create_enhanced_prompt(ip, log_data, context, user_agent, behavioral_metrics)
        
        response = self.groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=config.GROQ_MODEL,
            temperature=0.1,
            max_tokens=2000,
        )
        
        # Fixed: Access the first choice correctly
        content = response.choices[0].message.content
        
        analysis_data = self._extract_json_from_response(content)
        if not analysis_data:
            return self._create_error_analysis(ip, ["Failed to parse Groq response"], {"engine": "groq"})
        
        return self._parse_ai_response(ip, analysis_data, "groq")
    
    async def _analyze_with_deepseek(
        self,
        ip: str,
        log_data: Optional[str],
        context: Dict[str, Any],
        user_agent: Optional[str],
        behavioral_metrics: Optional[BehavioralMetrics]
    ) -> IPAnalysis:
        """Analyze using DeepSeek API"""
        
        prompt = self._create_enhanced_prompt(ip, log_data, context, user_agent, behavioral_metrics)
        
        response = self.deepseek_client.chat.completions.create(
            model=config.DEEPSEEK_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        
        analysis_data = self._extract_json_from_response(content)
        if not analysis_data:
            return self._create_error_analysis(ip, ["Failed to parse DeepSeek response"], {"engine": "deepseek"})
        
        return self._parse_ai_response(ip, analysis_data, "deepseek")
    
    def _create_enhanced_prompt(
        self,
        ip: str,
        log_data: Optional[str],
        context: Dict[str, Any],
        user_agent: Optional[str],
        behavioral_metrics: Optional[BehavioralMetrics]
    ) -> str:
        """Create enhanced analysis prompt"""
        
        base_prompt = f"""
You are an advanced cybersecurity expert analyzing IP address: {ip}

ANALYSIS REQUIREMENTS:
• Comprehensive threat assessment with detailed behavioral analysis
• Multi-dimensional risk evaluation including pattern recognition
• Advanced threat classification and confidence scoring
• Context-aware decision making with evidence-based reasoning

EVALUATION CRITERIA:
- IP reputation, geolocation, and hosting provider analysis
- Traffic pattern analysis and anomaly detection
- Known attack vector identification (brute force, injection, scanning, etc.)
- Behavioral consistency and automation indicators
- Temporal patterns and request distribution analysis

RESPONSE FORMAT - Return ONLY valid JSON:
{{
    "should_block": true,
    "confidence_score": 0.85,
    "risk_level": "high",
    "threat_types": ["brute_force", "scanning"],
    "reasons": ["Multiple failed login attempts", "High request frequency", "Suspicious endpoint patterns"],
    "analysis_details": {{
        "geolocation": "Unknown",
        "hosting_type": "datacenter",
        "threat_indicators": ["brute_force", "automated_scanning"],
        "behavioral_score": 0.9,
        "pattern_matches": ["login_bruteforce", "directory_traversal"]
    }}
}}

IMPORTANT:
- Return ONLY the JSON object (no markdown, no explanations)
- Be precise and evidence-based in your assessment
- Consider all provided context and behavioral data
"""

        if behavioral_metrics:
            base_prompt += f"""

BEHAVIORAL ANALYSIS DATA:
- Request Frequency: {behavioral_metrics.request_frequency:.2f} requests/minute
- Error Rate: {behavioral_metrics.error_rate:.2%}
- Unique Endpoints: {behavioral_metrics.unique_endpoints}
- Endpoint Diversity Score: {behavioral_metrics.endpoint_diversity_score:.2f}
- User Agent Consistency: {behavioral_metrics.user_agent_consistency:.2f}
- Suspicious Patterns: {behavioral_metrics.suspicious_patterns}
- Time Distribution: {behavioral_metrics.time_distribution}
- Status Code Distribution: {behavioral_metrics.status_code_distribution}

Use this behavioral data to enhance your threat assessment.
"""

        if log_data:
            # Truncate log data if too long
            truncated_logs = log_data[:config.MAX_LOG_SIZE] if len(log_data) > config.MAX_LOG_SIZE else log_data
            base_prompt += f"\n\nLOG DATA:\n{truncated_logs}\n\nAnalyze these logs for attack patterns and malicious behavior."

        if user_agent:
            base_prompt += f"\n\nUSER AGENT:\n{user_agent}\n\nEvaluate for bot indicators and malicious characteristics."

        if context:
            base_prompt += f"\n\nADDITIONAL CONTEXT:\n{json.dumps(context, indent=2)}"

        return base_prompt
    
    def _extract_json_from_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from API response"""
        if not content:
            return None

        content = content.strip()

        # Try direct JSON parsing first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Extract from code blocks
        json_patterns = [
            r'``````',
            r'``````',
            r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})',
        ]

        for pattern in json_patterns:
            matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
            for match in matches:
                try:
                    return json.loads(match.strip())
                except json.JSONDecodeError:
                    continue

        return None
    
    def _parse_ai_response(self, ip: str, data: Dict[str, Any], engine: str) -> IPAnalysis:
        """Parse AI response into IPAnalysis object"""
        try:
            # Parse threat types
            threat_types = []
            if 'threat_types' in data:
                for threat_str in data['threat_types']:
                    try:
                        threat_types.append(ThreatType(threat_str.lower()))
                    except ValueError:
                        continue

            # Validate and normalize confidence score
            confidence_score = max(0.0, min(1.0, float(data.get("confidence_score", 0.0))))

            # Parse risk level
            risk_level_str = str(data.get("risk_level", "low")).lower()
            try:
                risk_level = RiskLevel(risk_level_str)
            except ValueError:
                risk_level = RiskLevel.LOW

            return IPAnalysis(
                ip_address=ip,
                should_block=bool(data.get("should_block", False)),
                confidence_score=confidence_score,
                risk_level=risk_level,
                threat_types=threat_types,
                reasons=data.get("reasons", []),
                analysis_details=data.get("analysis_details", {}),
                analysis_engine=engine
            )

        except Exception as e:
            return self._create_error_analysis(ip, [f"Failed to parse {engine} response: {str(e)}"], {"engine": engine})
    
    def _merge_ai_results(self, results: List[IPAnalysis]) -> IPAnalysis:
        """Merge multiple AI analysis results"""
        if len(results) == 1:
            return results[0]

        # Take the most conservative approach
        should_block = any(r.should_block for r in results)
        confidence_score = max(r.confidence_score for r in results)
        
        # Take the highest risk level
        risk_levels = [r.risk_level for r in results]
        risk_level = max(risk_levels, key=lambda x: list(RiskLevel).index(x))
        
        # Combine reasons and threat types
        all_reasons = []
        all_threat_types = []
        combined_details = {}
        engines_used = []
        
        for result in results:
            all_reasons.extend(result.reasons)
            all_threat_types.extend(result.threat_types)
            combined_details.update(result.analysis_details)
            engines_used.append(result.analysis_engine)
        
        # Remove duplicates
        unique_reasons = list(set(all_reasons))
        unique_threat_types = list(set(all_threat_types))
        
        combined_details["engines_used"] = engines_used
        combined_details["merged_analysis"] = True
        
        return IPAnalysis(
            ip_address=results[0].ip_address,
            should_block=should_block,
            confidence_score=confidence_score,
            risk_level=risk_level,
            threat_types=unique_threat_types,
            reasons=unique_reasons,
            analysis_details=combined_details,
            analysis_engine="hybrid"
        )
    
    def _combine_analyses(
        self,
        ip: str,
        ai_analysis: IPAnalysis,
        behavioral_metrics: Optional[BehavioralMetrics],
        threat_types: List[ThreatType]
    ) -> IPAnalysis:
        """Combine AI analysis with behavioral analysis"""
        
        # Start with AI analysis
        combined_analysis = ai_analysis
        
        if behavioral_metrics:
            # Add behavioral metrics to analysis details
            combined_analysis.analysis_details["behavioral_metrics"] = {
                "request_frequency": behavioral_metrics.request_frequency,
                "error_rate": behavioral_metrics.error_rate,
                "unique_endpoints": behavioral_metrics.unique_endpoints,
                "endpoint_diversity_score": behavioral_metrics.endpoint_diversity_score,
                "user_agent_consistency": behavioral_metrics.user_agent_consistency,
                "suspicious_patterns": behavioral_metrics.suspicious_patterns
            }
            
            # Add behavioral threat types
            all_threat_types = list(set(combined_analysis.threat_types + threat_types))
            combined_analysis.threat_types = all_threat_types
            
            # Adjust confidence based on behavioral analysis
            behavioral_confidence = self._calculate_behavioral_confidence(behavioral_metrics, threat_types)
            
            # Combine confidences (weighted average)
            combined_confidence = (ai_analysis.confidence_score * 0.7) + (behavioral_confidence * 0.3)
            combined_analysis.confidence_score = min(1.0, combined_confidence)
            
            # Add behavioral reasons
            behavioral_reasons = self._generate_behavioral_reasons(behavioral_metrics, threat_types)
            combined_analysis.reasons.extend(behavioral_reasons)
            
            # Adjust blocking decision
            if behavioral_confidence >= config.MIN_CONFIDENCE_THRESHOLD:
                combined_analysis.should_block = True
        
        return combined_analysis
    
    def _calculate_behavioral_confidence(self, metrics: BehavioralMetrics, threat_types: List[ThreatType]) -> float:
        """Calculate confidence score based on behavioral metrics"""
        confidence = 0.0
        
        # High request frequency
        if metrics.request_frequency > 10:
            confidence += 0.3
        elif metrics.request_frequency > 5:
            confidence += 0.2
        
        # High error rate
        if metrics.error_rate > 0.7:
            confidence += 0.3
        elif metrics.error_rate > 0.4:
            confidence += 0.2
        
        # Suspicious patterns
        if metrics.suspicious_patterns:
            confidence += 0.2 * len(metrics.suspicious_patterns)
        
        # Low user agent consistency (bot indicator)
        if metrics.user_agent_consistency < 0.3:
            confidence += 0.2
        
        # High endpoint diversity (scanning indicator)
        if metrics.endpoint_diversity_score > 0.8:
            confidence += 0.2
        
        # Threat type bonuses
        for threat_type in threat_types:
            if threat_type != ThreatType.UNKNOWN:
                confidence += 0.1
        
        return min(1.0, confidence)
    
    def _generate_behavioral_reasons(self, metrics: BehavioralMetrics, threat_types: List[ThreatType]) -> List[str]:
        """Generate reasons based on behavioral analysis"""
        reasons = []
        
        if metrics.request_frequency > 10:
            reasons.append(f"High request frequency: {metrics.request_frequency:.1f} req/min")
        
        if metrics.error_rate > 0.5:
            reasons.append(f"High error rate: {metrics.error_rate:.1%}")
        
        if metrics.suspicious_patterns:
            reasons.append(f"Suspicious patterns detected: {', '.join(metrics.suspicious_patterns)}")
        
        if metrics.user_agent_consistency < 0.3:
            reasons.append("Low user agent consistency (bot-like behavior)")
        
        if metrics.endpoint_diversity_score > 0.8:
            reasons.append("High endpoint diversity (scanning behavior)")
        
        for threat_type in threat_types:
            if threat_type == ThreatType.BRUTE_FORCE:
                reasons.append("Brute force attack pattern detected")
            elif threat_type == ThreatType.SCANNING:
                reasons.append("Port/directory scanning behavior")
            elif threat_type == ThreatType.DDoS:
                reasons.append("DDoS attack pattern")
        
        return reasons
    
    def _create_error_analysis(self, ip: str, reasons: List[str], details: Dict[str, Any]) -> IPAnalysis:
        """Create error analysis response"""
        return IPAnalysis(
            ip_address=ip,
            should_block=False,
            confidence_score=0.0,
            risk_level=RiskLevel.LOW,
            reasons=reasons,
            analysis_details=details,
            analysis_engine="error"
        )
    
    def _create_fallback_analysis(self, ip: str) -> IPAnalysis:
        """Create fallback analysis when no engines are available"""
        return IPAnalysis(
            ip_address=ip,
            should_block=False,
            confidence_score=0.0,
            risk_level=RiskLevel.LOW,
            reasons=["No analysis engines available"],
            analysis_details={"fallback": True},
            analysis_engine="fallback"
        )
