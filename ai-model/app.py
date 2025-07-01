from AdvanceCache.Caching import AdvancedCache
from Ratelimiter.Limiter import RateLimiter
from prompt_templates.Templates import build_prompt_template,build_prompt_template_pdf
from utils.Extraction_pdf import extract_text_from_pdf,generate_topic_from_text
from flask import Flask, request, jsonify, render_template,render_template_string
from utils.Helpers import validate_input,validate_generated_content,generate_cache_key,allowed_file,enhance_response,calculate_difficulty_score
from utils.Debuger_pdf import debug_pdf_info


from flask import Flask, request, jsonify, render_template,render_template_string
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os
import json
import hashlib
import time
import logging
from datetime import datetime, timedelta
from functools import wraps
import re
from typing import Dict, List, Optional, Tuple
import threading
from collections import defaultdict
from dotenv import load_dotenv
import httpx
import PyPDF2 # type: ignore
from werkzeug.utils import secure_filename
from io import BytesIO
import tempfile
from flask_cors import CORS

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
httpx_client = httpx.Client()

app = Flask(__name__)
api_key = os.getenv('API_KEY')
json_sort_key = os.getenv("JSON_SORT_KEYS")
CORS(
  app,
  resources={r"/*": {"origins": "*"}},
  supports_credentials=True,
  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allow_headers=["*"]
)
app.config[json_sort_key] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", api_key)



    
# Initialize LangChain components
chat_model = ChatGroq(
    temperature=0.2,
    model="llama3-8b-8192",
    api_key=GROQ_API_KEY, # type: ignore
    max_tokens=8000,
    http_client=httpx_client
)

cache = AdvancedCache(max_size=2000, ttl_seconds=7200)
rate_limiter = RateLimiter(max_requests=50, window_seconds=3600)


@app.route('/info')
def home():
    """API documentation page"""
    return render_template("index.html" )


@app.route('/')
def home2():
    """API documentation page"""
    return render_template("Home.html" )



@app.route('/generate_mcqs_from_pdf', methods=['POST'])
def generate_mcqs_from_pdf():
    """Generate MCQs from uploaded PDF file with improved error handling"""
    try:
        # Check if file is present
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        
        file = request.files['pdf_file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Additional file validation
        if file.content_length and file.content_length > 16 * 1024 * 1024:
            return jsonify({"error": "File too large. Maximum size is 16MB"}), 400
        
        # Get optional parameters
        try:
            num_questions = int(request.form.get('num_questions', 10))
        except ValueError:
            return jsonify({"error": "Invalid num_questions parameter"}), 400
            
        difficulty = request.form.get('difficulty', 'medium').lower()
        question_type = request.form.get('question_type', 'academic').lower()
        
        # Validate parameters
        if num_questions < 1 or num_questions > 50:
            return jsonify({"error": "Number of questions must be between 1 and 50"}), 400
        
        if difficulty not in ["easy", "medium", "hard", "expert"]:
            return jsonify({"error": "Invalid difficulty level"}), 400
        
        if question_type not in ["academic", "practical", "conceptual"]:
            return jsonify({"error": "Invalid question type"}), 400
        
        # Check rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({"error": "Rate limit exceeded"}), 429
        
        logger.info(f"Processing PDF upload: {file.filename}, Size: {file.content_length if file.content_length else 'Unknown'}")
        
        # Debug PDF info (optional - can be removed in production)
        debug_info = debug_pdf_info(file)
        logger.info(f"PDF Debug Info: {debug_info}")
        
        # Extract text from PDF
        success, text_content = extract_text_from_pdf(file)
        if not success:
            logger.error(f"PDF processing failed: {text_content}")
            return jsonify({
                "error": "PDF processing failed", 
                "message": text_content,
                "debug_info": debug_info,
                "suggestions": [
                    "Ensure the PDF is not encrypted",
                    "Check if the PDF contains extractable text (not just images)",
                    "Try with a different PDF file",
                    "Ensure the PDF is not corrupted"
                ]
            }), 400
        
        logger.info(f"Successfully extracted {len(text_content)} characters from PDF")
        logger.debug(f"Text sample: {text_content[:200]}...")
        
        # Generate topic from text
        topic = generate_topic_from_text(text_content)
        logger.info(f"Generated topic: {topic}")
        
        # Check cache (based on text hash)
        text_hash = hashlib.md5(text_content.encode()).hexdigest()
        cache_key = f"pdf_{text_hash}_{difficulty}_{num_questions}_{question_type}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            logger.info("Cache hit for PDF content")
            return jsonify({**cached_result, "cached": True})
        
        # Build LangChain prompt for PDF content
        prompt_template = build_prompt_template_pdf(question_type)
        timestamp = datetime.now().isoformat()
        
        # Create LangChain chain
        chain = (
            RunnablePassthrough.assign(timestamp=lambda _: timestamp)
            | prompt_template
            | chat_model
            | StrOutputParser()
        )
        
        # Generate with retry logic
        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Generating MCQs (attempt {attempt + 1}) - Topic: {topic}, Difficulty: {difficulty}")
                
                # Invoke LangChain
                response = chain.invoke({
                    "topic": topic,
                    "difficulty": difficulty,
                    "num_questions": num_questions,
                    "text_content": text_content,
                    "timestamp": timestamp
                })
                
                logger.debug(f"LLM Response sample: {response[:500]}...")
                
                # Validate generated content
                is_valid_content, json_data = validate_generated_content(response)
                if is_valid_content and json_data:
                    # Enhance response with PDF-specific metadata
                    enhanced_data = enhance_response(json_data)
                    
                    # Add PDF-specific metadata
                    enhanced_data["metadata"]["source_file"] = secure_filename(file.filename) # type: ignore
                    enhanced_data["metadata"]["content_length"] = len(text_content)
                    enhanced_data["metadata"]["auto_generated_topic"] = topic
                    enhanced_data["metadata"]["extraction_method"] = "PyPDF2"
                    
                    # Cache the result
                    cache.set(cache_key, enhanced_data)
                    
                    logger.info(f"Successfully generated {len(enhanced_data.get('questions', []))} questions for topic: {topic}")
                    return jsonify({**enhanced_data, "cached": False})
                
                logger.warning(f"Invalid content generated on attempt {attempt + 1}")
                logger.debug(f"Raw response: {response}")
                last_error = "Generated content validation failed"
                
            except Exception as e:
                last_error = str(e)
                logger.error(f"Generation attempt {attempt + 1} failed: {last_error}")
                if attempt == max_retries - 1:
                    break
                time.sleep(1)  # Brief pause before retry
        
        return jsonify({
            "error": "Generation failed",
            "message": f"Unable to generate valid questions after {max_retries} attempts",
            "last_error": last_error,
            "debug_info": {
                "topic": topic,
                "text_length": len(text_content),
                "text_sample": text_content[:200] + "..." if len(text_content) > 200 else text_content
            }
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in generate_mcqs_from_pdf: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred while processing the PDF",
            "details": str(e)
        }), 500
        

        
@app.route('/debug_pdf', methods=['POST'])
def debug_pdf():
    """Debug endpoint to check PDF processing without generating questions"""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        
        file = request.files['pdf_file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get PDF debug info
        debug_info = debug_pdf_info(file)
        
        # Try text extraction
        success, text_content = extract_text_from_pdf(file)
        
        result = {
            "filename": file.filename,
            "debug_info": debug_info,
            "extraction_success": success,
            "extraction_result": text_content if success else None,
            "extraction_error": text_content if not success else None,
            "text_length": len(text_content) if success else 0,
            "text_sample": text_content[:500] + "..." if success and len(text_content) > 500 else text_content if success else None
        }
        
        if success:
            # Try topic generation
            topic = generate_topic_from_text(text_content)
            result["generated_topic"] = topic
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Debug PDF error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/generate_mcqs', methods=['POST'])
def generate_mcqs():
    """Enhanced MCQ generation endpoint with LangChain"""
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_msg = validate_input(data)
        if not is_valid:
            return jsonify({"error": "Validation failed", "message": error_msg}), 400
        
        # Extract parameters
        topic = data["topic"].strip()
        difficulty = data.get("difficulty", "medium").lower()
        num_questions = data.get("num_questions", 5)
        question_type = data.get("question_type", "academic")
        
        # Check rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({"error": "Rate limit exceeded"}), 429
        
        # Check cache
        cache_key = generate_cache_key(topic, difficulty, num_questions, question_type)
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for topic: {topic}")
            return jsonify({**cached_result, "cached": True})
        
        # Build LangChain prompt
        prompt_template = build_prompt_template(question_type)
        timestamp = datetime.now().isoformat()
        
        # Create LangChain chain
        chain = (
            RunnablePassthrough.assign(timestamp=lambda _: timestamp)
            | prompt_template
            | chat_model
            | StrOutputParser()
        )
        
        # Generate with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Generating MCQs (attempt {attempt + 1}) - Topic: {topic}, Difficulty: {difficulty}")
                
                # Invoke LangChain
                response = chain.invoke({
                    "topic": topic,
                    "difficulty": difficulty,
                    "num_questions": num_questions
                })
                
                # Validate generated content
                is_valid_content, json_data = validate_generated_content(response)
                if is_valid_content and json_data:
                    # Enhance response
                    enhanced_data = enhance_response(json_data)
                    
                    # Cache the result
                    cache.set(cache_key, enhanced_data)
                    
                    logger.info(f"Successfully generated {len(enhanced_data.get('questions', []))} questions for topic: {topic}")
                    return jsonify({**enhanced_data, "cached": False})
                
                logger.warning(f"Invalid content generated on attempt {attempt + 1}")
                
            except Exception as e:
                logger.error(f"Generation attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
                time.sleep(1)  # Brief pause before retry
        
        return jsonify({
            "error": "Generation failed",
            "message": "Unable to generate valid questions after multiple attempts"
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in generate_mcqs: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.2.0",
        "cache_size": len(cache.cache),
        "uptime": "Available",
        "langchain": True,
        "pdf_support": True
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get API statistics"""
    return jsonify({
        "cache_stats": {
            "current_size": len(cache.cache),
            "max_size": cache.max_size,
            "ttl_seconds": cache.ttl_seconds
        },
        "rate_limit_stats": {
            "max_requests_per_hour": rate_limiter.max_requests,
            "window_seconds": rate_limiter.window_seconds
        },
        "supported_features": {
            "question_types": ["academic", "practical", "conceptual"],
            "difficulty_levels": ["easy", "medium", "hard", "expert"],
            "max_questions": 50,
            "bloom_taxonomy": True,
            "explanations": True,
            "analytics": True,
            "langchain_integration": True,
            "pdf_upload": True,
            "max_file_size_mb": 16
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "File too large", "message": "Maximum file size is 16MB"}), 413

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    logger.info("Starting Enhanced MCQ Generator API with PDF Support...")
    logger.info(f"Cache configured: max_size={cache.max_size}, ttl={cache.ttl_seconds}s")
    logger.info(f"Rate limiting: {rate_limiter.max_requests} requests per hour")
    logger.info(f"LangChain model: llama3-8b-8192")
    logger.info("PDF upload support: ENABLED (max 16MB)")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )