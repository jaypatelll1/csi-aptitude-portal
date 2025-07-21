import json
import re
import asyncio
from typing import Optional, Dict, Any
from groq import Groq
from config.setting import config
from models.schemas import IPAnalysis, RiskLevel

class GroqClient:
    def __init__(self):
        if not config.GROQ_API_KEY:
            raise ValueError("Groq API key not configured")
        
        self.client = Groq(api_key=config.GROQ_API_KEY)
        self.model = config.GROQ_MODEL

    def create_analysis_prompt(
        self,
        ip: str,
        log_data: Optional[str] = None,
        context: Dict[str, Any] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Create analysis prompt for Groq API"""
        base_prompt = f"""
You are a cybersecurity expert analyzing IP address: {ip}

ANALYSIS REQUIREMENTS:
• Assess malicious behavior indicators
• Identify attack patterns and threat types
• Determine risk level (low, medium, high, critical)
• Provide blocking recommendation with confidence score

EVALUATION CRITERIA:
- IP reputation and blacklist status
- Traffic patterns and anomalies
- Geolocation and hosting provider type
- Known attack vectors (brute force, scanning, malware, etc.)

CRITICAL: Respond ONLY with valid JSON in this exact format (no extra text, no markdown, no explanations):

{{
    "should_block": true,
    "confidence_score": 0.85,
    "risk_level": "high",
    "reasons": ["Multiple failed login attempts", "Brute force attack pattern"],
    "analysis_details": {{
        "geolocation": "Unknown",
        "hosting_type": "datacenter",
        "threat_indicators": ["brute_force", "credential_stuffing"]
    }}
}}

IMPORTANT:
- Return ONLY the JSON object
- No markdown formatting (no ```
- No additional text or explanations
- Be accurate and evidence-based
"""

        if log_data:
            base_prompt += f"\n\nLOG DATA:\n{log_data}\n\nAnalyze the log data for suspicious patterns, attack indicators, and anomalous behavior."
        
        if user_agent:
            base_prompt += f"\n\nUSER AGENT:\n{user_agent}\n\nAnalyze for bot patterns, known malicious user agents, and suspicious characteristics."
        
        if context:
            base_prompt += f"\n\nADDITIONAL CONTEXT:\n{json.dumps(context, indent=2)}\n\nConsider this context when making your assessment."

        return base_prompt

    def _extract_json_from_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from API response, handling various formats"""
        if not content:
            return None

        content = content.strip()

        # Try direct JSON parsing first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Try to extract JSON from markdown code blocks
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

    async def analyze_ip(
        self,
        ip: str,
        log_data: Optional[str] = None,
        context: Dict[str, Any] = None,
        user_agent: Optional[str] = None
    ) -> IPAnalysis:
        """Analyze IP address using Groq API"""
        try:
            prompt = self.create_analysis_prompt(ip, log_data, context, user_agent)

            print(f"Analyzing IP: {ip}")

            # Make sync API call
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.1,
                max_tokens=2000,
            )

            content = response.choices[0].message.content
            print(f"Raw API Response: {content}")

            if not content or not content.strip():
                return self._create_error_analysis(
                    ip,
                    ["Empty response from Groq API"],
                    {"error_type": "empty_response"}
                )

            # Extract JSON from response
            analysis_data = self._extract_json_from_response(content)

            if not analysis_data:
                return self._create_error_analysis(
                    ip,
                    ["Failed to parse API response - invalid JSON format"],
                    {
                        "error_type": "json_parse_error",
                        "raw_response": content[:1000]
                    }
                )

            print(f"Parsed JSON: {analysis_data}")

            # Validate required fields
            required_fields = ["should_block", "confidence_score", "risk_level", "reasons"]
            missing_fields = [field for field in required_fields if field not in analysis_data]
            
            if missing_fields:
                return self._create_error_analysis(
                    ip,
                    [f"Missing required fields: {missing_fields}"],
                    {
                        "error_type": "missing_fields",
                        "received_data": analysis_data,
                        "missing_fields": missing_fields
                    }
                )

            # Validate and normalize data
            try:
                confidence_score = max(0.0, min(1.0, float(analysis_data["confidence_score"])))
                
                # Handle risk level validation
                risk_level_str = str(analysis_data["risk_level"]).lower()
                valid_levels = ["low", "medium", "high", "critical"]
                if risk_level_str not in valid_levels:
                    risk_level_str = "medium"
                
                risk_level = RiskLevel(risk_level_str)

                # Ensure reasons is a list
                reasons = analysis_data["reasons"]
                if not isinstance(reasons, list):
                    reasons = [str(reasons)]

                return IPAnalysis(
                    ip_address=ip,
                    should_block=bool(analysis_data["should_block"]),
                    confidence_score=confidence_score,
                    risk_level=risk_level,
                    reasons=reasons,
                    analysis_details=analysis_data.get("analysis_details", {})
                )

            except (ValueError, TypeError) as e:
                return self._create_error_analysis(
                    ip,
                    [f"Invalid data format: {str(e)}"],
                    {
                        "error_type": "data_validation_error",
                        "validation_error": str(e),
                        "received_data": analysis_data
                    }
                )

        except Exception as e:
            print(f"API Error: {str(e)}")
            return self._create_error_analysis(
                ip,
                [f"Analysis failed: {str(e)}"],
                {"error_type": "api_error", "error_details": str(e)}
            )

    def _create_error_analysis(self, ip: str, reasons: list, details: dict) -> IPAnalysis:
        """Create an error analysis response"""
        return IPAnalysis(
            ip_address=ip,
            should_block=False,
            confidence_score=0.0,
            risk_level=RiskLevel.LOW,
            reasons=reasons,
            analysis_details=details
        )
