from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import json

class QuestionTypeClassifier:
    """Classifies content to determine optimal question type distribution"""
    
    @staticmethod
    def analyze_content(content: str) -> Dict[str, float]:
        """Analyze content to suggest question type distribution"""
        content_lower = content.lower()
        
        # Keywords for each question type
        type_keywords = {
            'technical': ['algorithm', 'method', 'process', 'technique', 'implementation', 'system', 'technology', 'software', 'hardware', 'programming', 'database', 'network', 'protocol', 'architecture', 'framework', 'api', 'interface'],
            'quantitative': ['calculate', 'measure', 'percentage', 'ratio', 'formula', 'equation', 'data', 'statistics', 'analysis', 'graph', 'chart', 'number', 'value', 'cost', 'price', 'budget', 'metric', 'performance', 'efficiency'],
            'verbal': ['definition', 'meaning', 'terminology', 'vocabulary', 'language', 'communication', 'writing', 'reading', 'comprehension', 'grammar', 'syntax', 'semantics', 'literature', 'text', 'document'],
            'logical': ['reasoning', 'logic', 'pattern', 'sequence', 'problem', 'solution', 'cause', 'effect', 'relationship', 'comparison', 'analysis', 'evaluation', 'decision', 'strategy', 'approach'],
            'general': ['history', 'background', 'overview', 'introduction', 'basic', 'fundamental', 'principle', 'concept', 'theory', 'knowledge', 'information', 'fact', 'example', 'case', 'study']
        }
        
        scores = {}
        total_words = len(content.split())
        
        for question_type, keywords in type_keywords.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            scores[question_type] = min(score / total_words * 100, 50)  # Cap at 50%
        
        # Normalize scores
        total_score = sum(scores.values())
        if total_score > 0:
            scores = {k: v / total_score for k, v in scores.items()}
        else:
            # Default distribution if no keywords found
            scores = {'technical': 0.25, 'quantitative': 0.2, 'verbal': 0.2, 'logical': 0.2, 'general': 0.15}
        
        return scores

class DifficultyScaler:
    """Scales question difficulty based on complexity indicators"""
    
    @staticmethod
    def get_difficulty_parameters(difficulty: str) -> Dict[str, any]:
        """Get parameters for each difficulty level"""
        return {
            'easy': {
                'bloom_levels': ['remember', 'understand'],
                'complexity_words': ['basic', 'simple', 'define', 'identify', 'list'],
                'time_range': (30, 60),
                'distractor_complexity': 'simple'
            },
            'medium': {
                'bloom_levels': ['understand', 'apply', 'analyze'],
                'complexity_words': ['apply', 'analyze', 'compare', 'classify', 'explain'],
                'time_range': (45, 90),
                'distractor_complexity': 'moderate'
            },
            'hard': {
                'bloom_levels': ['analyze', 'evaluate', 'create'],
                'complexity_words': ['evaluate', 'synthesize', 'judge', 'defend', 'construct'],
                'time_range': (60, 120),
                'distractor_complexity': 'complex'
            },
            'expert': {
                'bloom_levels': ['evaluate', 'create'],
                'complexity_words': ['design', 'formulate', 'hypothesize', 'investigate', 'critique'],
                'time_range': (90, 180),
                'distractor_complexity': 'very_complex'
            }
        }.get(difficulty, {
            'bloom_levels': ['understand', 'apply'],
            'complexity_words': ['apply', 'analyze'],
            'time_range': (45, 90),
            'distractor_complexity': 'moderate'
        })

def extract_topic_from_pdf_content(text_content: str) -> str:
    """
    Enhanced topic extraction with multiple strategies and better accuracy
    """
    if not text_content or len(text_content.strip()) < 10:
        return "Document Content Analysis"
    
    # Strategy 1: Look for title-like patterns with better filtering
    lines = [line.strip() for line in text_content.strip().split('\n') if line.strip()]
    
    # Check first few lines for titles
    for i, line in enumerate(lines[:7]):
        if line and 10 <= len(line) <= 100:
            # Enhanced title detection
            if (line.isupper() or line.istitle()) and not line.endswith('.'):
                # Check if it's not just a header/footer
                if not re.match(r'^(page|chapter|\d+|\w+\s+\d+)$', line.lower()):
                    return line.title()
    
    # Strategy 2: Enhanced pattern matching for academic documents
    header_patterns = [
        r'(?:chapter|unit|section|lesson|part)\s+\d+[:\s]*(.+)',
        r'(?:title|subject|topic)[:\s]+(.+)',
        r'(?:about|regarding|concerning)[:\s]+(.+)',
        r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}):',  # Title: pattern
        r'^\d+\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',  # Numbered titles
    ]
    
    for line in lines[:25]:  # Check first 25 lines
        for pattern in header_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                extracted = match.group(1).strip()
                if 5 <= len(extracted) <= 80:
                    return extracted.title()
    
    # Strategy 3: Enhanced keyword extraction with domain detection
    # Clean and tokenize text
    clean_text = re.sub(r'[^\w\s]', ' ', text_content.lower())
    words = clean_text.split()
    
    # Enhanced stop words
    stop_words = {
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
        'a', 'an', 'from', 'up', 'out', 'down', 'off', 'over', 'under', 'again', 'further',
        'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
        'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so',
        'than', 'too', 'very', 'just', 'now', 'also', 'page', 'pages', 'figure', 'table'
    }
    
    # Count meaningful terms with better filtering
    word_freq = {}
    for word in words:
        if len(word) > 3 and word not in stop_words and word.isalpha():
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Domain-specific term detection
    domain_indicators = {
        'computer_science': ['algorithm', 'programming', 'software', 'database', 'network', 'system', 'code', 'data', 'computer'],
        'mathematics': ['equation', 'formula', 'theorem', 'proof', 'function', 'variable', 'calculation', 'graph', 'matrix'],
        'biology': ['cell', 'organism', 'gene', 'protein', 'evolution', 'species', 'biology', 'molecular', 'DNA'],
        'physics': ['force', 'energy', 'motion', 'wave', 'particle', 'quantum', 'physics', 'mechanics', 'electromagnetic'],
        'chemistry': ['molecule', 'atom', 'reaction', 'compound', 'element', 'chemical', 'bond', 'solution', 'acid'],
        'business': ['management', 'marketing', 'finance', 'strategy', 'business', 'company', 'market', 'customer', 'profit'],
        'history': ['century', 'historical', 'ancient', 'period', 'civilization', 'culture', 'war', 'empire', 'dynasty'],
        'literature': ['novel', 'author', 'character', 'theme', 'narrative', 'poetry', 'literature', 'story', 'writing']
    }
    
    domain_scores = {}
    for domain, indicators in domain_indicators.items():
        score = sum(word_freq.get(word, 0) for word in indicators)
        if score > 0:
            domain_scores[domain] = score
    
    # Get top domain and terms
    if domain_scores:
        top_domain = max(domain_scores, key=domain_scores.get)
        domain_name = top_domain.replace('_', ' ').title()
        
        # Get top terms from the domain
        top_terms = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
        meaningful_terms = [term[0].title() for term in top_terms if term[1] > 1]
        
        if meaningful_terms:
            return f"{domain_name}: {' and '.join(meaningful_terms)}"
        else:
            return domain_name
    
    # Strategy 4: Get most frequent meaningful terms
    if word_freq:
        top_terms = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
        meaningful_terms = [term[0].title() for term in top_terms if term[1] > 1]
        if meaningful_terms:
            return " and ".join(meaningful_terms)
    
    # Strategy 5: Enhanced sentence extraction
    sentences = re.split(r'[.!?]+', text_content)
    for sentence in sentences[:10]:
        sentence = sentence.strip()
        if 15 <= len(sentence) <= 100:
            # Check if it's a meaningful sentence (not just metadata)
            if not re.match(r'^(page|figure|table|\d+|copyright)', sentence.lower()):
                return sentence.title()
    
    return "Advanced Document Analysis"

def build_enhanced_json_structure() -> str:
    """Build enhanced JSON structure with more comprehensive metadata"""
    return '''
Return ONLY this JSON structure (no additional text):
{
  "metadata": {
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "total_questions": {num_questions},
    "generation_time": "{timestamp}",
    "source": "Generated Content",
    "bloom_taxonomy_levels": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
    "question_types_included": ["general_knowledge", "quantitative_aptitude", "verbal_ability", "technical", "logical_reasoning"],
    "difficulty_distribution": {
      "easy": 0,
      "medium": 0,
      "hard": 0,
      "expert": 0
    },
    "estimated_total_time_minutes": 0,
    "quality_indicators": {
      "distractor_quality": "high",
      "concept_coverage": "comprehensive",
      "bloom_level_diversity": "varied"
    },
    "content_areas": [],
    "prerequisites": [],
    "learning_objectives": []
  },
  "questions": [
    {
      "id": 1,
      "question": "Clear, specific, and unambiguous question text",
      "question_type": "technical",
      "difficulty_level": "medium",
      "options": {
        "A": "Plausible and well-crafted first option",
        "B": "Plausible and well-crafted second option", 
        "C": "Plausible and well-crafted third option",
        "D": "Plausible and well-crafted fourth option"
      },
      "correct_answer": "A",
      "explanation": "Comprehensive explanation of why this answer is correct, including reasoning and context",
      "distractor_explanations": {
        "B": "Why this option is incorrect",
        "C": "Why this option is incorrect",
        "D": "Why this option is incorrect"
      },
      "bloom_level": "analyze",
      "estimated_time_seconds": 60,
      "difficulty_justification": "Explanation of why this question is at the specified difficulty level",
      "tags": ["concept1", "concept2", "skill_area"],
      "cognitive_load": "medium",
      "prerequisite_knowledge": ["basic_concept1", "basic_concept2"],
      "learning_objective": "What the student should learn from this question",
      "common_mistakes": ["mistake1", "mistake2"],
      "hint": "Optional hint for struggling students",
      "reference_materials": ["textbook_chapter", "online_resource"]
    }
  ],
  "assessment_guidelines": {
    "time_limit_minutes": 0,
    "passing_score_percentage": 70,
    "recommended_preparation": ["topic1", "topic2"],
    "difficulty_progression": "gradual"
  },
  "quality_metrics": {
    "question_clarity": "high",
    "option_plausibility": "high",
    "distractor_effectiveness": "high",
    "content_validity": "high",
    "cognitive_complexity": "appropriate"
  }
}'''

def build_prompt_template_pdf(question_type: str) -> ChatPromptTemplate:
    """Enhanced PDF-based question generation with advanced features"""
    
    base_system = (
        "You are an expert educational assessment designer with advanced knowledge in psychometrics, "
        "cognitive science, and educational testing. You specialize in creating high-quality, "
        "valid, and reliable multiple-choice questions based on document content. "
        "Your questions are used in professional educational assessments and must meet the highest standards. "
        "Always respond with valid JSON only, following the exact structure provided."
    )
    
    json_structure = build_enhanced_json_structure()
    
    # Enhanced question type instructions
    question_type_instructions = {
        "academic": {
            "focus": "Rigorous academic assessment with deep conceptual understanding",
            "distribution": "40% technical, 25% logical reasoning, 20% general knowledge, 10% quantitative, 5% verbal",
            "bloom_emphasis": "Higher-order thinking skills (analyze, evaluate, create)",
            "special_instructions": (
                "- Prioritize conceptual understanding over memorization\n"
                "- Include questions that test application of principles\n"
                "- Create questions that require synthesis of multiple concepts\n"
                "- Ensure questions align with academic learning objectives\n"
                "- Include meta-cognitive elements where appropriate"
            )
        },
        "practical": {
            "focus": "Real-world application and problem-solving scenarios",
            "distribution": "30% technical, 30% quantitative, 25% logical reasoning, 10% general knowledge, 5% verbal",
            "bloom_emphasis": "Application and analysis with practical context",
            "special_instructions": (
                "- Create scenario-based questions with realistic contexts\n"
                "- Include case studies and practical examples\n"
                "- Focus on implementation and troubleshooting\n"
                "- Incorporate industry best practices and standards\n"
                "- Include decision-making and problem-solving scenarios"
            )
        },
        "conceptual": {
            "focus": "Deep understanding of relationships and abstract concepts",
            "distribution": "35% logical reasoning, 25% technical, 20% general knowledge, 15% verbal, 5% quantitative",
            "bloom_emphasis": "Understanding, analysis, and evaluation of concepts",
            "special_instructions": (
                "- Focus on relationships between concepts\n"
                "- Include cause-and-effect reasoning\n"
                "- Test understanding of abstract principles\n"
                "- Create questions about concept hierarchies\n"
                "- Include comparative analysis questions"
            )
        },
        "comprehensive": {
            "focus": "Balanced assessment across all cognitive domains",
            "distribution": "25% each for technical, logical, general knowledge, with 15% quantitative, 10% verbal",
            "bloom_emphasis": "Full range of Bloom's taxonomy levels",
            "special_instructions": (
                "- Ensure balanced coverage of all content areas\n"
                "- Include varied question types and formats\n"
                "- Test both breadth and depth of knowledge\n"
                "- Include interdisciplinary connections\n"
                "- Create questions of varying difficulty levels"
            )
        }
    }
    
    # Get question type configuration
    config = question_type_instructions.get(question_type, question_type_instructions["academic"])
    
    template = f"""
Based on the following text content, generate {{num_questions}} high-quality multiple-choice questions at {{difficulty}} level.

TEXT CONTENT:
{{text_content}}

ASSESSMENT CONFIGURATION:
Focus: {config['focus']}
Question Type Distribution: {config['distribution']}
Bloom's Taxonomy Emphasis: {config['bloom_emphasis']}

SPECIAL INSTRUCTIONS:
{config['special_instructions']}

QUESTION TYPE DEFINITIONS:
1. GENERAL KNOWLEDGE - Factual information, definitions, basic concepts, historical context
2. QUANTITATIVE APTITUDE - Mathematical calculations, numerical reasoning, data interpretation, statistical analysis
3. VERBAL ABILITY - Language comprehension, vocabulary, communication skills, textual analysis
4. TECHNICAL - Subject-specific procedures, methods, technologies, specialized knowledge
5. LOGICAL REASONING - Critical thinking, pattern recognition, logical deduction, problem-solving

QUALITY REQUIREMENTS:
- Each question must be directly based on the provided text content
- Questions must be unambiguous and have only one clearly correct answer
- All distractors (incorrect options) must be plausible and well-crafted
- Avoid trivial questions that test only memorization
- Include questions that test application, analysis, and synthesis
- Ensure cultural neutrality and accessibility
- Provide comprehensive explanations for all answers
- Include difficulty justification for each question

DIFFICULTY LEVEL GUIDELINES:
- Easy: Basic recall and understanding of explicitly stated information
- Medium: Application of concepts and analysis of relationships
- Hard: Synthesis of multiple concepts and evaluation of complex scenarios
- Expert: Advanced analysis, creative application, and critical evaluation

COGNITIVE COMPLEXITY INDICATORS:
- Simple: Direct recall or recognition
- Moderate: Application of learned procedures
- Complex: Analysis and synthesis of multiple elements
- Advanced: Evaluation and creation of new solutions

DISTRACTOR QUALITY STANDARDS:
- Must be grammatically parallel to the correct answer
- Should represent common misconceptions or errors
- Must be plausible to students who haven't mastered the content
- Should not be obviously incorrect or nonsensical
- Must test the same concept as the correct answer

{json_structure}

CRITICAL REMINDERS:
- Base ALL questions strictly on the provided text content
- Maintain high academic standards and assessment validity
- Ensure each question serves a clear educational purpose
- Provide value-added explanations that enhance learning
- Create questions that promote deeper understanding
- Follow the exact JSON structure without deviation
    """
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", template)
    ])

def build_prompt_template(question_type: str) -> ChatPromptTemplate:
    """Enhanced general topic question generation with advanced features"""
    
    base_system = (
        "You are an expert educational assessment designer with advanced knowledge in psychometrics, "
        "cognitive science, and educational testing. You create high-quality, valid, and reliable "
        "multiple-choice questions for professional educational assessments. "
        "Your questions meet the highest standards of educational measurement. "
        "Always respond with valid JSON only, following the exact structure provided."
    )
    
    json_structure = build_enhanced_json_structure()
    
    # Enhanced question type configurations
    question_type_configs = {
        "academic": {
            "focus": "Comprehensive academic assessment with emphasis on critical thinking",
            "distribution": "30% technical, 25% logical reasoning, 20% general knowledge, 15% quantitative, 10% verbal",
            "bloom_levels": ["understand", "apply", "analyze", "evaluate", "create"],
            "complexity": "high",
            "instructions": (
                "- Create questions that test deep conceptual understanding\n"
                "- Include application of theoretical knowledge\n"
                "- Focus on analysis and synthesis of concepts\n"
                "- Include interdisciplinary connections\n"
                "- Test higher-order thinking skills"
            )
        },
        "practical": {
            "focus": "Real-world application and professional competency assessment",
            "distribution": "35% technical, 25% quantitative, 20% logical reasoning, 15% general knowledge, 5% verbal",
            "bloom_levels": ["apply", "analyze", "evaluate"],
            "complexity": "applied",
            "instructions": (
                "- Create scenario-based questions with real-world context\n"
                "- Include problem-solving and decision-making scenarios\n"
                "- Focus on practical implementation and best practices\n"
                "- Include case studies and professional situations\n"
                "- Test competency in practical applications"
            )
        },
        "conceptual": {
            "focus": "Deep understanding of theoretical foundations and relationships",
            "distribution": "30% logical reasoning, 25% technical, 20% general knowledge, 15% verbal, 10% quantitative",
            "bloom_levels": ["understand", "analyze", "evaluate"],
            "complexity": "conceptual",
            "instructions": (
                "- Focus on relationships between concepts\n"
                "- Include cause-and-effect reasoning\n"
                "- Test understanding of abstract principles\n"
                "- Create questions about theoretical frameworks\n"
                "- Include comparative conceptual analysis"
            )
        },
        "comprehensive": {
            "focus": "Balanced assessment across all cognitive and skill domains",
            "distribution": "25% technical, 20% logical reasoning, 20% general knowledge, 20% quantitative, 15% verbal",
            "bloom_levels": ["remember", "understand", "apply", "analyze", "evaluate", "create"],
            "complexity": "varied",
            "instructions": (
                "- Ensure balanced coverage across all question types\n"
                "- Include varied difficulty levels and cognitive demands\n"
                "- Test both breadth and depth of knowledge\n"
                "- Include multiple perspectives and approaches\n"
                "- Create comprehensive assessment coverage"
            )
        }
    }
    
    # Get configuration or default to academic
    config = question_type_configs.get(question_type, question_type_configs["academic"])
    
    template = f"""
Generate {{num_questions}} high-quality, professionally crafted multiple-choice questions about "{{topic}}" at {{difficulty}} level.

ASSESSMENT CONFIGURATION:
Focus: {config['focus']}
Question Type Distribution: {config['distribution']}
Bloom's Taxonomy Levels: {', '.join(config['bloom_levels'])}
Cognitive Complexity: {config['complexity']}

SPECIAL INSTRUCTIONS:
{config['instructions']}

QUESTION TYPE DEFINITIONS AND REQUIREMENTS:
1. GENERAL KNOWLEDGE - Broad factual information, foundational concepts, historical context, established facts
   • Test fundamental understanding and factual recall
   • Include definitional and factual questions
   • Cover background information and context

2. QUANTITATIVE APTITUDE - Mathematical reasoning, numerical analysis, data interpretation, problem-solving
   • Include calculations, formulas, and mathematical relationships
   • Test numerical reasoning and data analysis skills
   • Include statistical interpretation and mathematical applications

3. VERBAL ABILITY - Language skills, comprehension, communication, textual analysis
   • Test reading comprehension and vocabulary
   • Include language usage and communication skills
   • Cover textual analysis and interpretation

4. TECHNICAL - Subject-specific knowledge, procedures, methods, specialized concepts
   • Test domain-specific expertise and technical skills
   • Include procedural knowledge and technical applications
   • Cover specialized terminology and methods

5. LOGICAL REASONING - Critical thinking, pattern recognition, logical deduction, problem-solving
   • Test analytical thinking and logical analysis
   • Include pattern recognition and logical relationships
   • Cover critical thinking and reasoning skills

QUALITY STANDARDS:
- Each question must be clear, unambiguous, and professionally written
- All options must be grammatically parallel and plausible
- Distractors must represent realistic misconceptions or errors
- Questions must test meaningful learning objectives
- Include comprehensive explanations that enhance understanding
- Ensure cultural neutrality and accessibility
- Maintain high academic and professional standards

DIFFICULTY CALIBRATION:
- Easy (20-30%): Basic recall, recognition, simple application
- Medium (40-50%): Application, analysis, moderate complexity
- Hard (20-30%): Synthesis, evaluation, complex problem-solving
- Expert (5-10%): Advanced analysis, creative application, expert-level reasoning

COGNITIVE COMPLEXITY LEVELS:
- Simple: Direct recall and basic understanding
- Moderate: Application of procedures and analysis
- Complex: Synthesis and evaluation of multiple elements
- Advanced: Creation and critical evaluation

DISTRACTOR CONSTRUCTION PRINCIPLES:
- Must be grammatically consistent with the stem
- Should reflect common errors or misconceptions
- Must be plausible to students at the target level
- Should not contain obvious clues to incorrectness
- Must test the same concept domain as the correct answer

{json_structure}

CRITICAL REQUIREMENTS:
- Follow the exact JSON structure without any modifications
- Ensure all questions are educationally valuable and purposeful
- Create questions that promote learning and understanding
- Maintain consistency in quality and difficulty within each level
- Provide explanations that serve as teaching tools
- Include appropriate metadata for each question
- Generate questions that meet professional assessment standards
    """
    
    return ChatPromptTemplate.from_messages([
        ("system", base_system),
        ("human", template)
    ])

def create_adaptive_template(topic: str, difficulty: str, question_type: str, content_analysis: Optional[Dict] = None) -> ChatPromptTemplate:
    """Create adaptive template based on content analysis"""
    
    if content_analysis:
        # Adjust question type distribution based on content
        type_distribution = QuestionTypeClassifier.analyze_content(content_analysis.get('text', ''))
        difficulty_params = DifficultyScaler.get_difficulty_parameters(difficulty)
        
        # Create custom instructions based on analysis
        custom_instructions = f"""
ADAPTIVE CONFIGURATION BASED ON CONTENT ANALYSIS:
- Primary question types: {', '.join([k for k, v in type_distribution.items() if v > 0.2])}
- Recommended time per question: {difficulty_params['time_range'][0]}-{difficulty_params['time_range'][1]} seconds
- Cognitive complexity: {difficulty_params['distractor_complexity']}
- Bloom's taxonomy focus: {', '.join(difficulty_params['bloom_levels'])}

CONTENT-SPECIFIC ADAPTATIONS:
- Question distribution adjusted based on content analysis
- Difficulty calibrated to match content complexity
- Question types optimized for content domain
        """
    else:
        custom_instructions = ""
    
    # Use the appropriate base template
    if 'text_content' in str(content_analysis):
        base_template = build_prompt_template_pdf(question_type)
    else:
        base_template = build_prompt_template(question_type)
    
    # Add adaptive instructions if available
    if custom_instructions:
        messages = base_template.messages
        human_message = messages[1]
        enhanced_content = custom_instructions + "\n\n" + human_message.prompt.template
        
        return ChatPromptTemplate.from_messages([
            messages[0],  # Keep system message
            ("human", enhanced_content)
        ])
    
    return base_template

# Export functions for backward compatibility
__all__ = [
    'extract_topic_from_pdf_content',
    'build_prompt_template_pdf', 
    'build_prompt_template',
    'create_adaptive_template',
    'QuestionTypeClassifier',
    'DifficultyScaler'
]