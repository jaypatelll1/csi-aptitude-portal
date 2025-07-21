import asyncio
import hashlib
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from config.setting import config
from core.groq_client import GroqClient
from core.cache_manager import SimpleCacheManager
from core.mongodb_manager import mongo
from models.schemas import APIRequest, APIResponse
from utils.decorators import async_route, rate_limit
from utils.helpers import validate_ip_address, sanitize_user_agent, normalize_log_data
from datetime import datetime, timedelta

def create_app() -> Flask:
    """Application factory function"""
    # Validate configuration before starting
    if not config.validate():
        raise ValueError(
            "Configuration validation failed - check your environment variables"
        )
    
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    
    # Configure CORS
    CORS(app, origins=config.ALLOWED_ORIGINS)
    
    # Initialize services
    try:
        groq_client = GroqClient()
        cache_manager = SimpleCacheManager(cache_ttl=config.CACHE_TTL)
    except Exception as e:
        raise ValueError(f"Failed to initialize services: {str(e)}")
    
    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint"""
        cache_stats = cache_manager.get_cache_stats()
        return jsonify({
            "status": "healthy",
            "service": "ip-guardian", 
            "version": "1.0.0",
            "groq_model": config.GROQ_MODEL,
            "cache_stats": cache_stats,
        })
    
    # Main analysis endpoint (API KEY REMOVED)
    @app.route("/api/v1/analyze-ip", methods=["POST"])
    @rate_limit(max_requests=config.RATE_LIMIT_PER_MINUTE)
    @async_route
    async def analyze_ip():
        """Analyze IP address for security threats"""
        try:
            # Parse request data
            data = request.get_json()
            if not data:
                return (
                    jsonify(
                        APIResponse(
                            success=False, error="Request body must be valid JSON"
                        ).__dict__
                    ),
                    400,
                )
            
            # Validate IP address
            ip = data.get("ip", "").strip()
            if not ip:
                return (
                    jsonify(
                        APIResponse(
                            success=False, error="IP address is required"
                        ).__dict__
                    ),
                    400,
                )
            
            if not validate_ip_address(ip):
                return (
                    jsonify(
                        APIResponse(
                            success=False, error="Invalid IP address format"
                        ).__dict__
                    ),
                    400,
                )
            
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
            }
            context_str = json.dumps(context_data, sort_keys=True)
            context_hash = hashlib.sha256(context_str.encode()).hexdigest()[:16]
            
            # Check cache first
            cached_analysis = cache_manager.get_analysis(ip, context_hash)
            if cached_analysis:
                return jsonify(
                    APIResponse(
                        success=True,
                        data={
                            "ip_address": cached_analysis.ip_address,
                            "should_block": cached_analysis.should_block,
                            "confidence_score": cached_analysis.confidence_score,
                            "risk_level": cached_analysis.risk_level.value,
                            "reasons": cached_analysis.reasons,
                            "analysis_details": cached_analysis.analysis_details,
                            "cached": True,
                            "timestamp": cached_analysis.timestamp.isoformat(),
                        },
                    ).__dict__
                )
            
            # Perform new analysis
            analysis = await groq_client.analyze_ip(
                ip=api_request.ip,
                log_data=api_request.log_data,
                context=api_request.additional_context,
                user_agent=api_request.user_agent,
            )
            
            # Cache the result
            cache_manager.store_analysis(analysis, context_hash)
            
            # Store in database
            mongo.store_analysis(analysis)
            
            # Return response
            return jsonify(
                APIResponse(
                    success=True,
                    data={
                        "ip_address": analysis.ip_address,
                        "should_block": analysis.should_block,
                        "confidence_score": analysis.confidence_score,
                        "risk_level": analysis.risk_level.value,
                        "reasons": analysis.reasons,
                        "analysis_details": analysis.analysis_details,
                        "cached": False,
                        "timestamp": analysis.timestamp.isoformat(),
                    },
                ).__dict__
            )
            
        except Exception as e:
            app.logger.error(f"Analysis error: {str(e)}")
            return (
                jsonify(
                    APIResponse(
                        success=False,
                        error="Internal server error occurred during analysis",
                    ).__dict__
                ),
                500,
            )
    
    # Dashboard route
    @app.route('/dashboard')
    def dashboard():
        """Render the dashboard with real-time data"""
        try:
            # Get dashboard statistics
            cache_stats = cache_manager.get_cache_stats()
            stats = mongo.get_dashboard_stats()
            
            # Get recent threats
            recent_threats = mongo.get_recent_threats(limit=10)
            
            return render_template('dashboard.html',
                                 stats=stats,
                                 recent_threats=recent_threats,
                                 cache_stats=cache_stats)
                                 
        except Exception as e:
            app.logger.error(f"Dashboard error: {str(e)}")
            return render_template('dashboard.html',
                                 stats={},
                                 recent_threats=[],
                                 cache_stats={})
    
    # API endpoints for dashboard data (API KEY REMOVED)
    @app.route("/api/v1/dashboard/stats", methods=["GET"])
    def get_dashboard_stats():
        """Get comprehensive dashboard statistics"""
        try:
            website_domain = request.args.get("domain", "main")
            stats = mongo.get_dashboard_stats(website_domain)
            return jsonify(APIResponse(success=True, data=stats).__dict__)
        except Exception as e:
            return (
                jsonify(
                    APIResponse(
                        success=False, error=f"Failed to fetch dashboard stats: {str(e)}"
                    ).__dict__
                ),
                500,
            )
    
    # Cache management endpoints (API KEY REMOVED)
    @app.route("/api/v1/cache/stats", methods=["GET"])
    def get_cache_stats():
        """Get cache statistics"""
        stats = cache_manager.get_cache_stats()
        return jsonify(APIResponse(success=True, data=stats).__dict__)
    
    @app.route("/api/v1/cache/clear", methods=["POST"])
    def clear_cache():
        """Clear all cache entries"""
        success = cache_manager.clear_all()
        return jsonify(
            APIResponse(
                success=success, data={"message": "All cache entries cleared"}
            ).__dict__
        )
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return (
            jsonify(APIResponse(success=False, error="Endpoint not found").__dict__),
            404,
        )
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return (
            jsonify(APIResponse(success=False, error="Method not allowed").__dict__),
            405,
        )
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return (
            jsonify(APIResponse(success=False, error="Internal server error").__dict__),
            500,
        )
    
    return app

# Create application instance
app = create_app()

if __name__ == "__main__":
    print(f"Starting IP Guardian API on port 5000...")
    print(f"Debug mode: {config.DEBUG}")
    print(f"Using Groq model: {config.GROQ_MODEL}")
    app.run(host="0.0.0.0", port=5000, debug=config.DEBUG, threaded=True)
