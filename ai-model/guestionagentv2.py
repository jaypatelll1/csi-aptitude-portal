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
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

app.config[json_sort_key] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", api_key)

# Initialize LangChain components
chat_model = ChatGroq(
    temperature=0.2,
    model="llama3-8b-8192",
    api_key=GROQ_API_KEY, # type: ignore
    max_tokens=4000,
    http_client=httpx_client
)

# Enhanced caching system
class AdvancedCache:
    def __init__(self, max_size=1000, ttl_seconds=3600):
        self.cache = {}
        self.access_times = {}
        self.creation_times = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                # Check TTL
                if time.time() - self.creation_times[key] > self.ttl_seconds:
                    self._remove(key)
                    return None
                self.access_times[key] = time.time()
                return self.cache[key]
            return None
    
    def set(self, key, value):
        with self.lock:
            if len(self.cache) >= self.max_size:
                self._evict_lru()
            
            self.cache[key] = value
            self.access_times[key] = time.time()
            self.creation_times[key] = time.time()
    
    def _remove(self, key):
        if key in self.cache:
            del self.cache[key]
            del self.access_times[key]
            del self.creation_times[key]
    
    def _evict_lru(self):
        if not self.cache:
            return
        lru_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
        self._remove(lru_key)

# Rate limiting
class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = threading.Lock()
    
    def is_allowed(self, identifier):
        with self.lock:
            now = time.time()
            # Clean old requests
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if now - req_time < self.window_seconds
            ]
            
            if len(self.requests[identifier]) < self.max_requests:
                self.requests[identifier].append(now)
                return True
            return False

# Initialize systems
cache = AdvancedCache(max_size=2000, ttl_seconds=7200)
rate_limiter = RateLimiter(max_requests=50, window_seconds=3600)

def extract_text_from_pdf(pdf_file) -> Tuple[bool, str]:
    """Extract text from uploaded PDF file with improved error handling"""
    try:
        # Reset file pointer to beginning
        pdf_file.seek(0)
        
        # Method 1: Try direct processing from memory
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file.read()))
            text_content = ""
            
            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                return False, "PDF is encrypted and cannot be processed"
            
            # Extract text from all pages
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text_content += page_text + "\n"
                except Exception as page_error:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {str(page_error)}")
                    continue
            
            # Clean and validate extracted text
            text_content = text_content.strip()
            
            # More lenient text length check
            if len(text_content) < 50:  # Reduced from 100
                return False, f"PDF content too short ({len(text_content)} characters). Extracted text: '{text_content[:200]}...'"
            
            # Limit text length to prevent token overflow
            if len(text_content) > 12000:  # Increased limit
                text_content = text_content[:12000] + "..."
            
            logger.info(f"Successfully extracted {len(text_content)} characters from PDF")
            return True, text_content
                
        except Exception as memory_error:
            logger.warning(f"Memory processing failed: {str(memory_error)}, trying file method")
            
            # Method 2: Fallback to temporary file method
            pdf_file.seek(0)  # Reset file pointer
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                # Write uploaded file to temp file
                pdf_file.save(tmp_file.name)
                
                try:
                    # Extract text using PyPDF2 from file
                    with open(tmp_file.name, 'rb') as file:
                        pdf_reader = PyPDF2.PdfReader(file)
                        
                        # Check if PDF is encrypted
                        if pdf_reader.is_encrypted:
                            return False, "PDF is encrypted and cannot be processed"
                        
                        text_content = ""
                        total_pages = len(pdf_reader.pages)
                        
                        logger.info(f"Processing PDF with {total_pages} pages")
                        
                        for page_num in range(total_pages):
                            try:
                                page = pdf_reader.pages[page_num]
                                page_text = page.extract_text()
                                if page_text:
                                    text_content += page_text + "\n"
                                logger.debug(f"Processed page {page_num + 1}/{total_pages}")
                            except Exception as page_error:
                                logger.warning(f"Error extracting text from page {page_num + 1}: {str(page_error)}")
                                continue
                        
                        # Clean extracted text
                        text_content = text_content.strip()
                        
                        if len(text_content) < 50:
                            return False, f"PDF content too short after extraction ({len(text_content)} characters). Sample: '{text_content[:200]}...'"
                        
                        # Limit text length
                        if len(text_content) > 12000:
                            text_content = text_content[:12000] + "..."
                        
                        logger.info(f"Successfully extracted {len(text_content)} characters from PDF using file method")
                        return True, text_content
                        
                finally:
                    # Clean up temporary file
                    try:
                        os.unlink(tmp_file.name)
                    except:
                        pass
                
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return False, f"Failed to extract text from PDF: {str(e)}"
    
    
    
def generate_topic_from_text(text_content: str) -> str:
    """Generate a topic summary from the extracted text with better error handling"""
    try:
        # Import here to avoid circular imports
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        
        # Create a simple prompt to extract main topic
        topic_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert at analyzing text and identifying main topics. Extract the primary subject/topic from the given text in 2-5 words. Be concise and specific."),
            ("human", "Analyze this text and provide the main topic in 2-5 words:\n\n{text}")
        ])
        
        # Limit text for topic extraction (first 2000 characters for better context)
        limited_text = text_content[:2000] if len(text_content) > 2000 else text_content
        
        # Use global chat_model (assuming it's available in your main file)
        # You'll need to pass this as a parameter or import it
        # topic_chain = topic_prompt | chat_model | StrOutputParser()
        # topic = topic_chain.invoke({"text": limited_text})
        
        # Fallback: Extract topic from first few sentences
        sentences = text_content.split('.')[:3]  # First 3 sentences
        first_text = '. '.join(sentences)
        
        # Simple keyword extraction as fallback
        common_words = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']
        words = first_text.lower().split()
        filtered_words = [word.strip('.,!?;:()[]{}') for word in words if word.lower() not in common_words and len(word) > 3]
        
        if filtered_words:
            # Take first few meaningful words
            topic = ' '.join(filtered_words[:3]).title()
        else:
            topic = "Document Content"
        
        # Clean and validate topic
        topic = topic.strip().replace('"', '').replace("'", "")
        if len(topic) > 100:
            topic = topic[:100]
        
        return topic if topic else "Document Content"
        
    except Exception as e:
        logger.error(f"Error generating topic from text: {str(e)}")
        return "Document Content"

# Additional helper function for debugging
def debug_pdf_info(pdf_file):
    """Debug function to get PDF information"""
    try:
        pdf_file.seek(0)
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file.read()))
        
        info = {
            "pages": len(pdf_reader.pages),
            "encrypted": pdf_reader.is_encrypted,
            "metadata": pdf_reader.metadata if hasattr(pdf_reader, 'metadata') else None
        }
        
        # Try to get text from first page
        if len(pdf_reader.pages) > 0:
            try:
                first_page_text = pdf_reader.pages[0].extract_text()
                info["first_page_sample"] = first_page_text[:200] if first_page_text else "No text extracted"
                info["first_page_length"] = len(first_page_text) if first_page_text else 0
            except Exception as e:
                info["first_page_error"] = str(e)
        
        return info
    except Exception as e:
        return {"error": str(e)}
    
def build_prompt_template_pdf(question_type: str) -> ChatPromptTemplate:
    """Build LangChain prompt template for PDF content-based questions"""
    base_system = (
        "You are an expert educational content creator specializing in generating high-quality multiple-choice questions "
        "based on provided text content. Always respond with valid JSON only."
    )
    
    templates = {
        "academic": (
            "Based on the following text content, generate {num_questions} academically rigorous multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "Requirements:\n"
            "- Questions must be based strictly on the provided text content\n"
            "- Test deep understanding, not just memorization\n"
            "- Include application, analysis, and synthesis level questions\n"
            "- Options should be plausible and challenging\n"
            "- Avoid obvious incorrect answers\n"
            "- Include explanations for correct answers\n"
            "- Reference specific parts of the text when relevant\n\n"
            "Difficulty Guidelines:\n"
            "- Easy: Basic concepts and definitions from the text\n"
            "- Medium: Application and analysis of text content\n"
            "- Hard: Synthesis, evaluation, and complex reasoning about the text\n"
            "- Expert: Advanced analysis and critical thinking about the content\n\n"
            "Return ONLY this JSON structure:\n"
            "{{\n"
            "  \"metadata\": {{\n"
            "    \"topic\": \"{topic}\",\n"
            "    \"difficulty\": \"{difficulty}\",\n"
            "    \"total_questions\": {num_questions},\n"
            "    \"generation_time\": \"{timestamp}\",\n"
            "    \"source\": \"PDF Document\",\n"
            "    \"bloom_taxonomy_levels\": [\"remember\", \"understand\", \"apply\", \"analyze\", \"evaluate\", \"create\"]\n"
            "  }},\n"
            "  \"questions\": [\n"
            "    {{\n"
            "      \"id\": 1,\n"
            "      \"question\": \"Clear, specific question text based on the document\",\n"
            "      \"options\": {{\n"
            "        \"A\": \"First option\",\n"
            "        \"B\": \"Second option\", \n"
            "        \"C\": \"Third option\",\n"
            "        \"D\": \"Fourth option\"\n"
            "      }},\n"
            "      \"correct_answer\": \"A\",\n"
            "      \"explanation\": \"Detailed explanation of why this answer is correct, referencing the source text\",\n"
            "      \"bloom_level\": \"analyze\",\n"
            "      \"estimated_time_seconds\": 45,\n"
            "      \"tags\": [\"concept1\", \"concept2\"],\n"
            "      \"text_reference\": \"Brief reference to relevant part of the source text\"\n"
            "    }}\n"
            "  ]\n"
            "}}"
        ),
        "practical": (
            "Based on the following text content, generate {num_questions} practical, application-based multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "Focus on:\n"
            "- Real-world applications of the content\n"
            "- Practical implementation of concepts from the text\n"
            "- Problem-solving scenarios based on the document\n"
            "- Best practices mentioned in the text\n\n"
            "Return the same JSON structure as academic template."
        ),
        "conceptual": (
            "Based on the following text content, generate {num_questions} conceptual multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "Focus on:\n"
            "- Theoretical understanding of concepts in the text\n"
            "- Relationships between ideas presented\n"
            "- Cause and effect relationships from the content\n"
            "- Comparative analysis of concepts in the document\n\n"
            "Return the same JSON structure as academic template."
        )
    }
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", templates.get(question_type, templates["academic"]))
    ])

def build_prompt_template(question_type: str) -> ChatPromptTemplate:
    """Build LangChain prompt template based on question type"""
    base_system = (
        "You are an expert educational content creator specializing in high-quality multiple-choice questions. "
        "Always respond with valid JSON only."
    )
    
    templates = {
        "academic": (
            "Generate {num_questions} academically rigorous multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "Requirements:\n"
            "- Questions must test deep understanding, not just memorization\n"
            "- Include application, analysis, and synthesis level questions\n"
            "- Options should be plausible and challenging\n"
            "- Avoid obvious incorrect answers\n"
            "- Include explanations for correct answers\n\n"
            "Difficulty Guidelines:\n"
            "- Easy: Basic concepts and definitions\n"
            "- Medium: Application and analysis\n"
            "- Hard: Synthesis, evaluation, and complex problem-solving\n"
            "- Expert: Advanced theoretical concepts and real-world applications\n\n"
            "Return ONLY this JSON structure:\n"
            "{{\n"
            "  \"metadata\": {{\n"
            "    \"topic\": \"{topic}\",\n"
            "    \"difficulty\": \"{difficulty}\",\n"
            "    \"total_questions\": {num_questions},\n"
            "    \"generation_time\": \"{timestamp}\",\n"
            "    \"bloom_taxonomy_levels\": [\"remember\", \"understand\", \"apply\", \"analyze\", \"evaluate\", \"create\"]\n"
            "  }},\n"
            "  \"questions\": [\n"
            "    {{\n"
            "      \"id\": 1,\n"
            "      \"question\": \"Clear, specific question text\",\n"
            "      \"options\": {{\n"
            "        \"A\": \"First option\",\n"
            "        \"B\": \"Second option\", \n"
            "        \"C\": \"Third option\",\n"
            "        \"D\": \"Fourth option\"\n"
            "      }},\n"
            "      \"correct_answer\": \"A\",\n"
            "      \"explanation\": \"Detailed explanation of why this answer is correct\",\n"
            "      \"bloom_level\": \"analyze\",\n"
            "      \"estimated_time_seconds\": 45,\n"
            "      \"tags\": [\"concept1\", \"concept2\"]\n"
            "    }}\n"
            "  ]\n"
            "}}"
        ),
        "practical": (
            "Generate {num_questions} practical, scenario-based multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "Focus on:\n"
            "- Real-world applications and case studies\n"
            "- Problem-solving scenarios\n"
            "- Best practices and common mistakes\n"
            "- Industry standards and procedures\n\n"
            "Return the same JSON structure as academic template."
        ),
        "conceptual": (
            "Generate {num_questions} conceptual multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "Focus on:\n"
            "- Theoretical understanding\n"
            "- Relationships between concepts\n"
            "- Cause and effect relationships\n"
            "- Comparative analysis\n\n"
            "Return the same JSON structure as academic template."
        )
    }
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", templates.get(question_type, templates["academic"]))
    ])

def validate_input(data: Dict) -> Tuple[bool, str]:
    """Enhanced input validation"""
    if not data:
        return False, "No data provided"
    
    topic = data.get("topic", "").strip()
    if not topic or len(topic) < 2:
        return False, "Topic must be at least 2 characters long"
    
    if len(topic) > 200:
        return False, "Topic must be less than 200 characters"
    
    difficulty = data.get("difficulty", "medium").lower()
    valid_difficulties = ["easy", "medium", "hard", "expert"]
    if difficulty not in valid_difficulties:
        return False, f"Difficulty must be one of: {', '.join(valid_difficulties)}"
    
    num_questions = data.get("num_questions", 5)
    if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 50:
        return False, "Number of questions must be between 1 and 50"
    
    question_type = data.get("question_type", "academic")
    valid_types = ["academic", "practical", "conceptual"]
    if question_type not in valid_types:
        return False, f"Question type must be one of: {', '.join(valid_types)}"
    
    return True, ""

def allowed_file(filename):
    """Check if the uploaded file is a PDF"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

def generate_cache_key(topic: str, difficulty: str, num_questions: int, question_type: str) -> str:
    """Generate a secure cache key"""
    content = f"{topic.lower()}_{difficulty.lower()}_{num_questions}_{question_type}"
    return hashlib.md5(content.encode()).hexdigest()

def validate_generated_content(content: str) -> Tuple[bool, Optional[Dict]]:
    """Validate and parse generated content"""
    try:
        # Find JSON in response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            return False, None
        
        json_data = json.loads(json_match.group())
        
        # Validate structure
        required_fields = ["metadata", "questions"]
        if not all(field in json_data for field in required_fields):
            return False, None
        
        questions = json_data.get("questions", [])
        if not questions:
            return False, None
        
        # Validate each question
        for i, q in enumerate(questions):
            required_q_fields = ["question", "options", "correct_answer"]
            if not all(field in q for field in required_q_fields):
                logger.warning(f"Question {i+1} missing required fields")
                return False, None
            
            # Validate options
            options = q.get("options", {})
            if len(options) != 4 or not all(key in options for key in ["A", "B", "C", "D"]):
                logger.warning(f"Question {i+1} has invalid options structure")
                return False, None
            
            # Validate correct answer
            if q.get("correct_answer") not in ["A", "B", "C", "D"]:
                logger.warning(f"Question {i+1} has invalid correct answer")
                return False, None
        
        return True, json_data
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return False, None
    except Exception as e:
        logger.error(f"Content validation error: {e}")
        return False, None

def enhance_response(json_data: Dict) -> Dict:
    """Add enhancements to the response"""
    # Add quality metrics
    questions = json_data.get("questions", [])
    
    # Calculate estimated total time
    total_time = sum(q.get("estimated_time_seconds", 60) for q in questions)
    
    # Add statistics
    bloom_levels = [q.get("bloom_level", "remember") for q in questions]
    bloom_distribution = {level: bloom_levels.count(level) for level in set(bloom_levels)}
    
    json_data["analytics"] = {
        "total_estimated_time_minutes": round(total_time / 60, 1),
        "average_time_per_question": round(total_time / len(questions), 1),
        "bloom_taxonomy_distribution": bloom_distribution,
        "difficulty_score": calculate_difficulty_score(json_data.get("metadata", {}).get("difficulty", "medium")),
        "quality_indicators": {
            "has_explanations": all("explanation" in q for q in questions),
            "has_bloom_levels": all("bloom_level" in q for q in questions),
            "has_tags": all("tags" in q for q in questions)
        }
    }
    
    return json_data

def calculate_difficulty_score(difficulty: str) -> float:
    """Calculate numerical difficulty score"""
    scores = {"easy": 0.25, "medium": 0.5, "hard": 0.75, "expert": 1.0}
    return scores.get(difficulty.lower(), 0.5)

@app.route('/')
def home():
    """API documentation page"""
    return render_template("index.html")

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