# Configuration
import os
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
import logging
import time




# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
JSON_SORT_KEYS = os.getenv("JSON_SORT_KEYS", "false").lower() == "true"
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
