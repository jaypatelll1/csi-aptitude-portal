from typing import Dict, Tuple, Optional
import hashlib
import json
import re

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
                print(f"Question {i+1} missing required fields")
                return False, None
            
            # Validate options
            options = q.get("options", {})
            if len(options) != 4 or not all(key in options for key in ["A", "B", "C", "D"]):
                print(f"Question {i+1} has invalid options structure")
                return False, None
            
            # Validate correct answer
            if q.get("correct_answer") not in ["A", "B", "C", "D"]:
                print(f"Question {i+1} has invalid correct answer")
                return False, None
        
        return True, json_data
    
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return False, None
    except Exception as e:
        print(f"Content validation error: {e}")
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
