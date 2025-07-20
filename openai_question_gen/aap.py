from AdvanceCache.Caching import AdvancedCache
from Ratelimiter.Limiter import RateLimiter
from prompt_templates.Templates import build_prompt_template, build_prompt_template_pdf, extract_topic_from_pdf_content
from utils.Extration_pdf import extract_text_from_pdf
from utils.Helpers import validate_input, validate_generated_content, generate_cache_key, allowed_file, enhance_response, calculate_difficulty_score
from utils.Debuger_pdf import debug_pdf_info
import time
from typing import Optional
from flask import Flask, request, jsonify, render_template
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os
import json
import hashlib
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from io import BytesIO
import tempfile
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
JSON_SORT_KEYS = os.getenv("JSON_SORT_KEYS", "false").lower() == "true"

# Validate API keys
if not OPENAI_API_KEY and not GROQ_API_KEY:
    raise ValueError("At least one API key (OpenAI or Groq) is required.")

# Enhanced CORS configuration
CORS(app, resources={r"/*": {"origins": [
    ""
    "https://phronesis.csiace.com",
    "https://csi-aptitude-portal-1-nu4p.onrender.com",
    "http://localhost:3000",
    "http://localhost:4000"
], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "supports_credentials": True}})

# Flask app configuration
app.config['JSON_SORT_KEYS'] = JSON_SORT_KEYS
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Complete ModelManager class with all methods properly defined
class ModelManager:
    def __init__(self):
        self.primary_model = None
        self.fallback_model = None
        self.current_model_name = None
        self.last_request_time = 0
        self.request_delay = 2.0  # Increased from 1.0
        self.using_fallback = False
        self.consecutive_failures = 0  # Add this line
        self.max_consecutive_failures = 3  # Add this line
        self.initialize_models()
        
    def initialize_models(self):
        """Initialize OpenAI and Groq models"""
        models_initialized = []
        
        # Initialize OpenAI model
        if OPENAI_API_KEY:
            try:
                self.primary_model = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.2,
                    max_tokens=8000,
                    api_key=OPENAI_API_KEY,
                    timeout=60,
                    max_retries=3
                )
                models_initialized.append("gpt-4o-mini")
                logger.info("OpenAI model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI model: {e}")
        
        # Initialize Groq model
        if GROQ_API_KEY:
            try:
                self.fallback_model = ChatGroq(
                    model="llama3-70b-8192",
                    temperature=0.2,
                    max_tokens=8000,
                    api_key=GROQ_API_KEY,
                    timeout=60,
                    max_retries=3
                )
                models_initialized.append("Groq Llama3-70B")
                logger.info("Groq model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq model: {e}")
        
        # Set primary model preference
        if self.primary_model:
            self.current_model_name = "gpt-4o-mini"
        elif self.fallback_model:
            self.primary_model = self.fallback_model
            self.current_model_name = "Groq Llama3-70B"
        else:
            raise ValueError("No models could be initialized")
        
        logger.info(f"Models initialized: {', '.join(models_initialized)}")
        logger.info(f"Primary model: {self.current_model_name}")
    
    def get_model_with_fallback(self):
        """Get the current model with enhanced fallback logic"""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        
        # Enforce minimum delay between requests
        if elapsed < self.request_delay:
            sleep_time = self.request_delay - elapsed
            logger.info(f"Rate limiting: Waiting {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
        
        # Auto-switch to fallback after consecutive failures
        if self.consecutive_failures >= self.max_consecutive_failures:
            if self.switch_to_fallback():
                logger.info("Auto-switched to fallback due to consecutive failures")
        
        if not self.using_fallback and self.primary_model:
            return self.primary_model, self.current_model_name
        elif self.fallback_model:
            return self.fallback_model, "Groq Llama3-70B (fallback)"
        else:
            raise ValueError("No models available")
    
    def switch_to_fallback(self):
        """Switch to fallback model"""
        if self.fallback_model and not self.using_fallback:
            self.using_fallback = True
            self.current_model_name = "Groq Llama3-70B (fallback)"
            logger.info("Switched to fallback model")
            return True
        return False
    
    def handle_api_error(self, error_str):
        """Handle specific API errors"""
        error_lower = error_str.lower()
        
        if any(keyword in error_lower for keyword in ['quota', 'billing', 'insufficient_quota']):
            logger.error("OpenAI quota exceeded - switching to fallback permanently")
            self.switch_to_fallback()
            return True
        
        if any(keyword in error_lower for keyword in ['rate limit', '429', 'too many requests']):
            self.consecutive_failures += 1
            self.request_delay = min(10.0, self.request_delay * 1.5)
            logger.warning(f"Rate limit hit. Consecutive failures: {self.consecutive_failures}")
            return True
        
        return False
    
    def adjust_rate_limit(self, success: bool):
        """Adjust request rate based on success/failure"""
        if success:
            self.consecutive_failures = 0
            self.request_delay = max(1.0, self.request_delay * 0.9)
        else:
            self.consecutive_failures += 1
            self.request_delay = min(10.0, self.request_delay * 1.2)
        
        logger.info(f"Adjusted request delay to {self.request_delay:.2f} seconds")

    def handle_api_error(self, error_str):
        error_lower = error_str.lower()
        
        if any(keyword in error_lower for keyword in ['quota', 'billing', 'insufficient_quota']):
            logger.error("OpenAI quota exceeded - switching to fallback permanently")
            self.switch_to_fallback()
            return True
        
        if any(keyword in error_lower for keyword in ['rate limit', '429', 'too many requests']):
            self.request_delay = min(10.0, self.request_delay * 1.5)
            logger.warning(f"Rate limit hit. Increased delay to {self.request_delay:.2f}s")
            return True
        
        return False
    # Updated execute_with_fallback function
    def execute_with_fallback(prompt_template, params, max_retries=3):
        """Execute model with enhanced fallback handling"""
        last_error = None
        
        for attempt in range(max_retries):
            try:
                current_model, model_name = model_manager.get_model_with_fallback()
                logger.info(f"Using model: {model_name} (attempt {attempt + 1})")
                
                # Create chain with current model
                chain = (
                    RunnablePassthrough.assign(timestamp=lambda _: params.get("timestamp", datetime.now().isoformat()))
                    | prompt_template
                    | current_model
                    | StrOutputParser()
                )
                
                # Execute the chain
                response = chain.invoke(params)
                
                # Validate generated content
                is_valid_content, json_data = validate_generated_content(response)
                if is_valid_content and json_data:
                    logger.info(f"Successfully generated content with {model_name}")
                    model_manager.adjust_rate_limit(True)
                    return True, json_data, model_name
                
                logger.warning(f"Invalid content generated with {model_name} on attempt {attempt + 1}")
                last_error = f"Generated content validation failed with {model_name}"
                
            except Exception as e:
                error_str = str(e)
                last_error = f"Model execution failed with {model_manager.current_model_name}: {error_str}"
                logger.error(f"Generation attempt {attempt + 1} failed: {last_error}")
                
                # Handle specific API errors
                if model_manager.handle_api_error(error_str):
                    logger.info("API error handled, adjusting strategy")
                    model_manager.adjust_rate_limit(False)
                    
                    # If quota exceeded, try fallback immediately
                    if 'quota' in error_str.lower() or 'billing' in error_str.lower():
                        logger.info("Quota exceeded - trying fallback immediately")
                        continue
                    
                    # For rate limits, wait longer
                    if 'rate limit' in error_str.lower() or '429' in error_str:
                        wait_time = min(30.0, 5.0 * (attempt + 1))
                        logger.info(f"Rate limit hit - waiting {wait_time:.2f} seconds")
                        time.sleep(wait_time)
                        continue
                
                model_manager.adjust_rate_limit(False)
                
                if attempt < max_retries - 1:
                    sleep_time = min(10.0, 2.0 * (attempt + 1))
                    logger.info(f"Waiting {sleep_time:.2f} seconds before retry...")
                    time.sleep(sleep_time)
        
        return False, last_error, model_manager.current_model_name

# Initialize model manager
model_manager = ModelManager()

# Initialize cache and rate limiter
cache = AdvancedCache(max_size=2000, ttl_seconds=7200)
rate_limiter = RateLimiter(max_requests=50, window_seconds=3600)

# Batch generation parameters
MAX_BATCH_SIZE = 25
MAX_TOTAL_QUESTIONS = 50
MAX_RETRIES = 5

def execute_with_fallback(prompt_template, params, max_retries=3):
    """Execute model with automatic fallback"""
    last_error = None
    
    for attempt in range(max_retries):
        try:
            current_model, model_name = model_manager.get_model_with_fallback()
            logger.info(f"Using model: {model_name} (attempt {attempt + 1})")
            
            # Create chain with current model
            chain = (
                RunnablePassthrough.assign(timestamp=lambda _: params.get("timestamp", datetime.now().isoformat()))
                | prompt_template
                | current_model
                | StrOutputParser()
            )
            
            # Execute the chain
            response = chain.invoke(params)
            
            # Validate generated content
            is_valid_content, json_data = validate_generated_content(response)
            if is_valid_content and json_data:
                logger.info(f"Successfully generated content with {model_name}")
                model_manager.adjust_rate_limit(True)
                return True, json_data, model_name
            
            logger.warning(f"Invalid content generated with {model_name} on attempt {attempt + 1}")
            last_error = f"Generated content validation failed with {model_name}"
            model_manager.adjust_rate_limit(False)
            
        except Exception as e:
            last_error = f"Model execution failed with {model_manager.current_model_name}: {str(e)}"
            logger.error(f"Generation attempt {attempt + 1} failed: {last_error}")
            model_manager.adjust_rate_limit(False)
            
            # Check for rate limit specifically
            if "rate limit" in str(e).lower() or "429" in str(e) or "quota" in str(e).lower():
                logger.warning("Rate limit or quota exceeded, trying fallback")
                if attempt == 0 and model_manager.switch_to_fallback():
                    logger.info("Switched to fallback model, retrying...")
                    continue
                else:
                    model_manager.request_delay = min(5.0, model_manager.request_delay * 2)
                    time.sleep(model_manager.request_delay)
            
            if attempt < max_retries - 1:
                sleep_time = min(5.0, 1.0 * (attempt + 1))
                logger.info(f"Waiting {sleep_time:.2f} seconds before retry...")
                time.sleep(sleep_time)
    
    return False, last_error, model_manager.current_model_name

def generate_in_batches(prompt_template, params, total_questions, batch_size=MAX_BATCH_SIZE):
    """Generate questions in batches"""
    all_questions = []
    seen_questions = set()
    batches = (total_questions + batch_size - 1) // batch_size
    used_model = model_manager.current_model_name
    
    for batch_num in range(batches):
        current_batch_size = min(batch_size, total_questions - len(all_questions))
        if current_batch_size <= 0:
            break
            
        params["num_questions"] = current_batch_size
        logger.info(f"Generating batch {batch_num+1}/{batches} with {current_batch_size} questions")
        
        success, result, model_name = execute_with_fallback(prompt_template, params)
        used_model = model_name
        
        if not success:
            logger.error(f"Batch {batch_num+1} failed: {result}")
            if batch_num == 0:
                return False, result, model_name
            break
        
        # Process batch questions
        try:
            batch_questions = result.get("questions", [])
            new_questions = []
            
            for q in batch_questions:
                question_text = q.get("question", "").strip()
                if question_text and question_text not in seen_questions:
                    seen_questions.add(question_text)
                    new_questions.append(q)
            
            all_questions.extend(new_questions)
            logger.info(f"Batch {batch_num+1} added {len(new_questions)} unique questions")
            
        except Exception as e:
            logger.error(f"Error processing batch: {e}")
            break
    
    if all_questions:
        result["questions"] = all_questions[:total_questions]
        result["num_questions"] = min(len(all_questions), total_questions)
        result["metadata"]["batch_count"] = batch_num + 1
        result["metadata"]["unique_questions"] = len(all_questions)
        return True, result, used_model
    
    return False, "No questions generated after batch processing", used_model

def handle_file_upload(file):
    """Safely handle file upload"""
    if not file or file.filename == '':
        return False, "No file selected"
    
    if not allowed_file(file.filename):
        return False, "Only PDF files are allowed"
    
    filename = secure_filename(file.filename)
    if not filename:
        return False, "Invalid filename"
    
    return True, filename

def validate_mcq_parameters(data):
    """Validate MCQ generation parameters"""
    if not data or 'topic' not in data:
        return False, "Topic is required"
    
    topic = data['topic'].strip()
    if not topic or len(topic) < 3:
        return False, "Topic must be at least 3 characters long"
    
    num_questions = data.get('num_questions', 5)
    if not isinstance(num_questions, int) or num_questions < 1 or num_questions > MAX_TOTAL_QUESTIONS:
        return False, f"Number of questions must be between 1 and {MAX_TOTAL_QUESTIONS}"
    
    difficulty = data.get('difficulty', 'medium').lower()
    if difficulty not in ['easy', 'medium', 'hard', 'expert']:
        return False, "Invalid difficulty level"
    
    question_type = data.get('question_type', 'academic').lower()
    if question_type not in ['academic', 'practical', 'conceptual']:
        return False, "Invalid question type"
    
    return True, None

# Route handlers
@app.route('/info')
def info():
    """API documentation page"""
    try:
        return render_template("index.html")
    except Exception as e:
        logger.error(f"Error serving info page: {e}")
        return jsonify({"error": "Unable to load documentation"}), 500

@app.route('/')
def home():
    """API home page"""
    try:
        return render_template("Home2.html")
    except Exception as e:
        logger.error(f"Error serving home page: {e}")
        return jsonify({"error": "Unable to load home page"}), 500

@app.route('/generate_mcqs_from_pdf', methods=['POST'])
def generate_mcqs_from_pdf():
    """Generate MCQs from uploaded PDF file"""
    try:
        # Validate file upload
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        
        file = request.files['pdf_file']
        is_valid_file, error_or_filename = handle_file_upload(file)
        if not is_valid_file:
            return jsonify({"error": error_or_filename}), 400
        
        # Get parameters
        try:
            num_questions = int(request.form.get('num_questions', 10))
            if num_questions < 1 or num_questions > MAX_TOTAL_QUESTIONS:
                return jsonify({"error": f"Number of questions must be between 1 and {MAX_TOTAL_QUESTIONS}"}), 400
        except ValueError:
            return jsonify({"error": "Invalid num_questions parameter"}), 400
        
        difficulty = request.form.get('difficulty', 'medium').lower()
        if difficulty not in ["easy", "medium", "hard", "expert"]:
            return jsonify({"error": "Invalid difficulty level"}), 400
        
        question_type = request.form.get('question_type', 'academic').lower()
        if question_type not in ["academic", "practical", "conceptual"]:
            return jsonify({"error": "Invalid question type"}), 400
        
        # Check rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        
        # Extract text from PDF
        success, text_content = extract_text_from_pdf(file)
        if not success:
            return jsonify({"error": "PDF processing failed", "message": text_content}), 400
        
        # Generate topic from text
        try:
            topic = extract_topic_from_pdf_content(text_content)
            if not topic:
                topic = f"Document Analysis - {error_or_filename.replace('.pdf', '')}"
        except Exception as e:
            topic = f"Document Analysis - {error_or_filename.replace('.pdf', '')}"
        
        # Check cache
        text_hash = hashlib.md5(text_content.encode()).hexdigest()
        cache_key = f"pdf_{text_hash}_{difficulty}_{num_questions}_{question_type}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            logger.info("Cache hit for PDF content")
            return jsonify({**cached_result, "cached": True})
        
        # Generate MCQs
        prompt_template = build_prompt_template_pdf(question_type)
        timestamp = datetime.now().isoformat()
        
        success, result, used_model = generate_in_batches(
            prompt_template,
            {"topic": topic, "difficulty": difficulty, "text_content": text_content, "timestamp": timestamp},
            num_questions
        )
        
        if not success:
            return jsonify({
                "error": "Generation failed",
                "message": "Unable to generate valid questions",
                "details": result,
                "attempted_model": used_model
            }), 500
        
        # Enhance and cache response
        enhanced_data = enhance_response(result)
        enhanced_data["metadata"]["source_file"] = error_or_filename
        enhanced_data["metadata"]["model_used"] = used_model
        cache.set(cache_key, enhanced_data)
        
        return jsonify({**enhanced_data, "cached": False})
        
    except Exception as e:
        logger.error(f"Error in generate_mcqs_from_pdf: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/generate_mcqs', methods=['POST'])
def generate_mcqs():
    """Generate MCQs from topic"""
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_msg = validate_mcq_parameters(data)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Extract parameters
        topic = data["topic"].strip()
        difficulty = data.get("difficulty", "medium").lower()
        num_questions = data.get("num_questions", 5)
        question_type = data.get("question_type", "academic").lower()
        
        # Check rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        
        # Check cache
        cache_key = generate_cache_key(topic, difficulty, num_questions, question_type)
        cached_result = cache.get(cache_key)
        if cached_result:
            return jsonify({**cached_result, "cached": True})
        
        # Generate MCQs
        prompt_template = build_prompt_template(question_type)
        timestamp = datetime.now().isoformat()
        
        success, result, used_model = generate_in_batches(
            prompt_template,
            {"topic": topic, "difficulty": difficulty, "timestamp": timestamp},
            num_questions
        )
        
        if not success:
            return jsonify({
                "error": "Generation failed",
                "message": "Unable to generate valid questions",
                "details": result,
                "attempted_model": used_model
            }), 500
        
        # Enhance and cache response
        enhanced_data = enhance_response(result)
        enhanced_data["metadata"]["model_used"] = used_model
        cache.set(cache_key, enhanced_data)
        
        return jsonify({**enhanced_data, "cached": False})
        
    except Exception as e:
        logger.error(f"Error in generate_mcqs: {e}")
        return jsonify({"error": "Internal server error"}), 500
    



@app.route('/debug_pdf', methods=['POST'])
def debug_pdf():
    """Debug endpoint for PDF processing"""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        
        file = request.files['pdf_file']
        is_valid_file, error_or_filename = handle_file_upload(file)
        if not is_valid_file:
            return jsonify({"error": error_or_filename}), 400
        
        debug_info = debug_pdf_info(file)
        success, text_content = extract_text_from_pdf(file)
        
        result = {
            "filename": error_or_filename,
            "debug_info": debug_info,
            "extraction_success": success,
            "text_length": len(text_content) if success else 0,
            "text_sample": text_content[:500] + "..." if success and len(text_content) > 500 else text_content if success else None
        }
        
        if not success:
            result["extraction_error"] = text_content
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Debug PDF error: {e}")
        return jsonify({"error": "Debug operation failed"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        current_model, model_name = model_manager.get_model_with_fallback()
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "current_model": model_name,
            "available_models": {"openai": OPENAI_API_KEY is not None, "groq": GROQ_API_KEY is not None}
        })
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get API statistics"""
    try:
        return jsonify({
            "cache_stats": {"current_size": len(cache.cache) if hasattr(cache, 'cache') else 0},
            "model_info": {"current_model": model_manager.current_model_name},
            "supported_features": {
                "question_types": ["academic", "practical", "conceptual"],
                "difficulty_levels": ["easy", "medium", "hard", "expert"],
                "max_questions": MAX_TOTAL_QUESTIONS
            }
        })
    except Exception as e:
        return jsonify({"error": "Unable to retrieve stats"}), 500

@app.route('/switch_model', methods=['POST'])
def switch_model():
    """Manually switch to fallback model"""
    try:
        if model_manager.switch_to_fallback():
            return jsonify({"success": True, "message": "Switched to fallback model", "current_model": model_manager.current_model_name})
        else:
            return jsonify({"success": False, "message": "No fallback model available", "current_model": model_manager.current_model_name})
    except Exception as e:
        return jsonify({"error": "Failed to switch model"}), 500
    
    
@app.route('/api_status', methods=['GET'])
def api_status():
    """Check API status and usage"""
    try:
        status = {
            "openai_available": OPENAI_API_KEY is not None,
            "groq_available": GROQ_API_KEY is not None,
            "current_model": model_manager.current_model_name,
            "using_fallback": model_manager.using_fallback,
            "consecutive_failures": model_manager.consecutive_failures,
            "current_delay": model_manager.request_delay
        }
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "File too large", "message": "Maximum file size is 16MB"}), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    logger.info("Starting Enhanced MCQ Generator API...")
    logger.info(f"OpenAI API Key: {'✓' if OPENAI_API_KEY else '✗'}")
    logger.info(f"Groq API Key: {'✓' if GROQ_API_KEY else '✗'}")
    logger.info(f"Primary model: {model_manager.current_model_name}")
    
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), threaded=True)