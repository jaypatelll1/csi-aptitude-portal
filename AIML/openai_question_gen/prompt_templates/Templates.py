from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import re

def extract_topic_from_pdf_content(text_content: str) -> str:
    """
    Extract meaningful topic from PDF content using multiple strategies
    """
    # Strategy 1: Look for title-like patterns (first few lines, all caps, etc.)
    lines = text_content.strip().split('\n')
    
    # Check first few lines for titles
    for i, line in enumerate(lines[:5]):
        line = line.strip()
        if line and len(line) > 10 and len(line) < 100:
            # Check if it looks like a title (capitalized, not too long)
            if (line.isupper() or line.istitle()) and not line.endswith('.'):
                return line
    
    # Strategy 2: Look for chapter/section headers
    chapter_patterns = [
        r'chapter\s+\d+[:\s]+(.+)',
        r'section\s+\d+[:\s]+(.+)',
        r'unit\s+\d+[:\s]+(.+)',
        r'lesson\s+\d+[:\s]+(.+)'
    ]
    
    for line in lines[:20]:  # Check first 20 lines
        for pattern in chapter_patterns:
            match = re.search(pattern, line.lower())
            if match:
                return match.group(1).strip().title()
    
    # Strategy 3: Extract key terms/concepts
    # Look for frequently mentioned technical terms
    words = text_content.lower().split()
    word_freq = {}
    
    # Filter out common words and count meaningful terms
    stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'}
    
    for word in words:
        word = re.sub(r'[^\w]', '', word)  # Remove punctuation
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get most frequent meaningful terms
    if word_freq:
        top_terms = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
        topic_terms = [term[0].title() for term in top_terms]
        return " and ".join(topic_terms)
    
    # Strategy 4: Fallback - use first meaningful sentence
    sentences = text_content.split('.')
    for sentence in sentences[:5]:
        sentence = sentence.strip()
        if len(sentence) > 20 and len(sentence) < 150:
            return sentence
    
    return "Document Content Analysis"

def build_prompt_template_pdf(question_type: str) -> ChatPromptTemplate:
    """Build LangChain prompt template for PDF content-based questions with enhanced question types"""
    base_system = (
        "You are an expert educational content creator specializing in generating high-quality multiple-choice questions "
        "based on provided text content. Always respond with valid JSON only."
    )
    
    # Common JSON structure for all question types
    json_structure = '''
Return ONLY this JSON structure:
{{
  "metadata": {{
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "total_questions": {num_questions},
    "generation_time": "{timestamp}",
    "source": "PDF Document",
    "bloom_taxonomy_levels": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
    "question_types_included": ["general knowledge", "quantitative aptitude", "verbal ability", "technical", "logical reasoning"]
  }},
  "questions": [
    {{
      "id": 1,
      "question": "Clear, specific question text based on the document",
      "question_type": "technical",
      "options": {{
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      }},
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this answer is correct, referencing the source text",
      "bloom_level": "analyze",
      "estimated_time_seconds": 45,
      "tags": ["concept1", "concept2"],
      "text_reference": "Brief reference to relevant part of the source text"
    }}
  ]
}}'''
    
    templates = {
        "academic": (
            "Based on the following text content, generate {num_questions} academically rigorous multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Requirements:\n"
            "- Questions must be based strictly on the provided text content\n"
            "- Distribute questions across different question types based on content\n"
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
            + json_structure
        ),
        "practical": (
            "Based on the following text content, generate {num_questions} practical, application-based multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Focus on:\n"
            "- Real-world applications of the content\n"
            "- Practical implementation of concepts from the text\n"
            "- Problem-solving scenarios based on the document\n"
            "- Best practices mentioned in the text\n"
            "- Include quantitative questions if numerical data is present\n"
            "- Include logical reasoning for process-based content\n\n"
            "Requirements:\n"
            "- Questions must be based strictly on the provided text content\n"
            "- Focus on how concepts can be applied in real situations\n"
            "- Create scenario-based questions when possible\n"
            "- Options should represent realistic choices\n"
            "- Include explanations for correct answers\n\n"
            + json_structure
        ),
        "conceptual": (
            "Based on the following text content, generate {num_questions} conceptual multiple-choice questions at {difficulty} level.\n\n"
            "TEXT CONTENT:\n{text_content}\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Focus on:\n"
            "- Theoretical understanding of concepts in the text\n"
            "- Relationships between ideas presented\n"
            "- Cause and effect relationships from the content\n"
            "- Comparative analysis of concepts in the document\n"
            "- Verbal ability questions for language-rich content\n"
            "- Logical reasoning for conceptual relationships\n\n"
            "Requirements:\n"
            "- Questions must be based strictly on the provided text content\n"
            "- Focus on understanding relationships and principles\n"
            "- Test comprehension of abstract concepts\n"
            "- Options should test deep conceptual understanding\n"
            "- Include explanations for correct answers\n\n"
            + json_structure
        )
    }
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", templates.get(question_type, templates["academic"]))
    ])

def build_prompt_template(question_type: str) -> ChatPromptTemplate:
    """Build LangChain prompt template based on question type with enhanced question categories"""
    base_system = (
        "You are an expert educational content creator specializing in high-quality multiple-choice questions. "
        "Always respond with valid JSON only."
    )
    
    # Common JSON structure for all question types
    json_structure = '''
Return ONLY this JSON structure:
{{
  "metadata": {{
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "total_questions": {num_questions},
    "generation_time": "{timestamp}",
    "bloom_taxonomy_levels": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
    "question_types_included": ["general_knowledge", "quantitative_aptitude", "verbal_ability", "technical", "logical_reasoning"]
  }},
  "questions": [
    {{
      "id": 1,
      "question": "Clear, specific question text",
      "question_type": "technical",
      "options": {{
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      }},
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this answer is correct",
      "bloom_level": "analyze",
      "estimated_time_seconds": 45,
      "tags": ["concept1", "concept2"]
    }}
  ]
}}'''
    
    templates = {
        "academic": (
            "Generate {num_questions} academically rigorous multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Requirements:\n"
            "- Questions must test deep understanding, not just memorization\n"
            "- Distribute questions across different question types appropriately\n"
            "- Include application, analysis, and synthesis level questions\n"
            "- Options should be plausible and challenging\n"
            "- Avoid obvious incorrect answers\n"
            "- Include explanations for correct answers\n\n"
            "Difficulty Guidelines:\n"
            "- Easy: Basic concepts and definitions\n"
            "- Medium: Application and analysis\n"
            "- Hard: Synthesis, evaluation, and complex problem-solving\n"
            "- Expert: Advanced theoretical concepts and real-world applications\n\n"
            + json_structure
        ),
        "practical": (
            "Generate {num_questions} practical, scenario-based multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Focus on:\n"
            "- Real-world applications and case studies\n"
            "- Problem-solving scenarios with quantitative aptitude\n"
            "- Best practices and common mistakes\n"
            "- Industry standards and procedures\n"
            "- Logical reasoning for decision-making scenarios\n\n"
            "Requirements:\n"
            "- Create scenario-based questions when possible\n"
            "- Focus on practical implementation\n"
            "- Include real-world context\n"
            "- Options should represent realistic choices\n"
            "- Include explanations for correct answers\n\n"
            + json_structure
        ),
        "conceptual": (
            "Generate {num_questions} conceptual multiple-choice questions about \"{topic}\" at {difficulty} level.\n\n"
            "For each question, determine the most appropriate question type from these categories:\n"
            "1. GENERAL KNOWLEDGE - Broad factual information and common knowledge topics\n"
            "2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data analysis\n"
            "3. VERBAL ABILITY - Language skills, comprehension, vocabulary, grammar\n"
            "4. TECHNICAL - Subject-specific technical concepts, procedures, methods\n"
            "5. LOGICAL REASONING - Critical thinking, patterns, logical deduction\n\n"
            "Focus on:\n"
            "- Theoretical understanding with general knowledge base\n"
            "- Relationships between concepts using logical reasoning\n"
            "- Cause and effect relationships\n"
            "- Comparative analysis with verbal ability elements\n"
            "- Abstract thinking and pattern recognition\n\n"
            "Requirements:\n"
            "- Focus on understanding relationships and principles\n"
            "- Test comprehension of abstract concepts\n"
            "- Include questions about concept connections\n"
            "- Options should test deep conceptual understanding\n"
            "- Include explanations for correct answers\n\n"
            + json_structure
        )
    }

    # Always return a ChatPromptTemplate, defaulting to "academic" if question_type is unknown
    template = templates.get(question_type, templates["academic"])
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", template)
    ])