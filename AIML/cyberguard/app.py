import asyncio
import hashlib
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime

from config.setting import config
from core.enhanced_analysis_client import EnhancedAnalysisClient
from core.cache_manager import SimpleCacheManager
from core.mongodb_manager import mongo
from models.schemas import APIRequest, APIResponse
from utils.decorators import async_route, rate_limit
from utils.helpers import validate_ip_address, sanitize_user_agent, normalize_log_data

def create_app() -> Flask:
    """Enhanced application factory function"""
    
    # Validate configuration
    if not config.validate():
        raise ValueError("Configuration validation failed - check your environment variables")

    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY

    # Configure CORS
    CORS(app, origins=config.ALLOWED_ORIGINS)

    # Initialize enhanced services
    try:
        analysis_client = EnhancedAnalysisClient()
        cache_manager = SimpleCacheManager(cache_ttl=config.CACHE_TTL)
    except Exception as e:
        raise ValueError(f"Failed to initialize services: {str(e)}")

    @app.route("/health", methods=["GET"])
    def health_check():
        """Enhanced health check endpoint"""
        cache_stats = cache_manager.get_cache_stats()
        
        # Check API availability
        api_status = {
            "groq_available": bool(config.GROQ_API_KEY and analysis_client.groq_client),
            "deepseek_available": bool(config.DEEPSEEK_API_KEY and analysis_client.deepseek_client),
            "analysis_engine": config.ANALYSIS_ENGINE
        }
        
        return jsonify({
            "status": "healthy",
            "service": "enhanced-ip-guardian",
            "version": "2.0.0",
            "api_status": api_status,
            "behavioral_analysis": config.ENABLE_BEHAVIORAL_ANALYSIS,
            "cache_stats": cache_stats,
            "features": [
                "advanced_log_processing",
                "behavioral_analysis", 
                "multi_engine_analysis",
                "threat_classification",
                "pattern_detection"
            ]
        })

    @app.route("/api/v1/analyze-ip", methods=["POST"])
    @rate_limit(max_requests=config.RATE_LIMIT_PER_MINUTE)
    @async_route
    async def analyze_ip():
        """Enhanced IP analysis endpoint"""
        try:
            # Parse and validate request
            data = request.get_json()
            if not data:
                return jsonify(APIResponse(
                    success=False, 
                    error="Request body must be valid JSON"
                ).__dict__), 400

            # Validate IP address
            ip = data.get("ip", "").strip()
            if not ip or not validate_ip_address(ip):
                return jsonify(APIResponse(
                    success=False, 
                    error="Valid IP address is required"
                ).__dict__), 400

            # Create API request object
            api_request = APIRequest(
                ip=ip,
                log_data=normalize_log_data(data.get("log_data")),
                user_agent=sanitize_user_agent(data.get("user_agent")),
                additional_context=data.get("context", {}),
            )

            # Generate cache key
            context_data = {
                "log_data": api_request.log_data,
                "user_agent": api_request.user_agent,
                "additional_context": api_request.additional_context,
                "analysis_engine": config.ANALYSIS_ENGINE
            }
            context_str = json.dumps(context_data, sort_keys=True)
            context_hash = hashlib.sha256(context_str.encode()).hexdigest()[:16]

            # Check cache first
            cached_analysis = cache_manager.get_analysis(ip, context_hash)
            if cached_analysis:
                return jsonify(APIResponse(
                    success=True,
                    data={
                        "ip_address": cached_analysis.ip_address,
                        "should_block": cached_analysis.should_block,
                        "confidence_score": cached_analysis.confidence_score,
                        "risk_level": cached_analysis.risk_level.value,
                        "threat_types": [t.value for t in cached_analysis.threat_types],
                        "reasons": cached_analysis.reasons,
                        "analysis_details": cached_analysis.analysis_details,
                        "analysis_engine": cached_analysis.analysis_engine,
                        "behavioral_metrics": cached_analysis.analysis_details.get("behavioral_metrics"),
                        "cached": True,
                        "timestamp": cached_analysis.timestamp.isoformat(),
                    },
                ).__dict__)

            # Perform enhanced analysis
            analysis = await analysis_client.analyze_ip(
                ip=api_request.ip,
                log_data=api_request.log_data,
                context=api_request.additional_context,
                user_agent=api_request.user_agent,
            )

            # Cache and store results
            cache_manager.store_analysis(analysis, context_hash)
            mongo.store_analysis(analysis)

            # Return enhanced response
            return jsonify(APIResponse(
                success=True,
                data={
                    "ip_address": analysis.ip_address,
                    "should_block": analysis.should_block,
                    "confidence_score": analysis.confidence_score,
                    "risk_level": analysis.risk_level.value,
                    "threat_types": [t.value for t in analysis.threat_types],
                    "reasons": analysis.reasons,
                    "analysis_details": analysis.analysis_details,
                    "analysis_engine": analysis.analysis_engine,
                    "behavioral_metrics": analysis.analysis_details.get("behavioral_metrics"),
                    "cached": False,
                    "timestamp": analysis.timestamp.isoformat(),
                },
            ).__dict__)

        except Exception as e:
            app.logger.error(f"Analysis error: {str(e)}")
            return jsonify(APIResponse(
                success=False,
                error="Internal server error occurred during analysis",
            ).__dict__), 500

    # Dashboard and other endpoints remain the same but with enhanced data
    @app.route('/dashboard')
    def dashboard():
        """Enhanced dashboard with new metrics"""
        try:
            cache_stats = cache_manager.get_cache_stats()
            stats = mongo.get_dashboard_stats()
            recent_threats = mongo.get_recent_threats(limit=10)
            
            # Add engine status
            engine_status = {
                "current_engine": config.ANALYSIS_ENGINE,
                "groq_available": bool(config.GROQ_API_KEY),
                "deepseek_available": bool(config.DEEPSEEK_API_KEY),
                "behavioral_analysis": config.ENABLE_BEHAVIORAL_ANALYSIS
            }
            
            return render_template('dashboard.html',
                                 stats=stats,
                                 recent_threats=recent_threats,
                                 cache_stats=cache_stats,
                                 engine_status=engine_status)
                                 
        except Exception as e:
            app.logger.error(f"Dashboard error: {str(e)}")
            return render_template('dashboard.html',
                                 stats={}, recent_threats=[], 
                                 cache_stats={}, engine_status={})

    # Error handlers remain the same
    @app.errorhandler(404)
    def not_found(error):
        return jsonify(APIResponse(success=False, error="Endpoint not found").__dict__), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify(APIResponse(success=False, error="Method not allowed").__dict__), 405

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify(APIResponse(success=False, error="Internal server error").__dict__), 500

    return app

# Create enhanced application instance
app = create_app()

if __name__ == "__main__":
    print("🚀 Starting Enhanced IP Guardian API...")
    print(f"📊 Debug mode: {config.DEBUG}")
    print(f"🤖 Analysis engine: {config.ANALYSIS_ENGINE}")
    print(f"🧠 Behavioral analysis: {'Enabled' if config.ENABLE_BEHAVIORAL_ANALYSIS else 'Disabled'}")
    print(f"🔧 Available APIs: Groq={'✅' if config.GROQ_API_KEY else '❌'} | DeepSeek={'✅' if config.DEEPSEEK_API_KEY else '❌'}")
    
    app.run(host="0.0.0.0", port=5000, debug=config.DEBUG, threaded=True)
