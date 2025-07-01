from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

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
