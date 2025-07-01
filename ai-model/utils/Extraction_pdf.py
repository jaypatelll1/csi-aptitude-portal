import time
import os
import tempfile
from io import BytesIO
from typing import Tuple
import PyPDF2
from collections import defaultdict  # if reused elsewhere


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
                    print(f"Warning: Error extracting text from page {page_num + 1}: {str(page_error)}")
                    continue
            
            # Clean and validate extracted text
            text_content = text_content.strip()
            
            # More lenient text length check
            if len(text_content) < 50:  # Reduced from 100
                return False, f"PDF content too short ({len(text_content)} characters). Extracted text: '{text_content[:200]}...'"
            
            # Limit text length to prevent token overflow
            if len(text_content) > 12000:  # Increased limit
                text_content = text_content[:12000] + "..."
            
            print(f"Info: Successfully extracted {len(text_content)} characters from PDF")
            return True, text_content
                
        except Exception as memory_error:
            print(f"Warning: Memory processing failed: {str(memory_error)}, trying file method")
            
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
                        
                        print(f"Info: Processing PDF with {total_pages} pages")
                        
                        for page_num in range(total_pages):
                            try:
                                page = pdf_reader.pages[page_num]
                                page_text = page.extract_text()
                                if page_text:
                                    text_content += page_text + "\n"
                                print(f"Debug: Processed page {page_num + 1}/{total_pages}")
                            except Exception as page_error:
                                print(f"Warning: Error extracting text from page {page_num + 1}: {str(page_error)}")
                                continue
                        
                        # Clean extracted text
                        text_content = text_content.strip()
                        
                        if len(text_content) < 50:
                            return False, f"PDF content too short after extraction ({len(text_content)} characters). Sample: '{text_content[:200]}...'"
                        
                        # Limit text length
                        if len(text_content) > 12000:
                            text_content = text_content[:12000] + "..."
                        
                        print(f"Info: Successfully extracted {len(text_content)} characters from PDF using file method")
                        return True, text_content
                        
                finally:
                    # Clean up temporary file
                    try:
                        os.unlink(tmp_file.name)
                    except:
                        pass
                
    except Exception as e:
        print(f"Error: Error extracting text from PDF: {str(e)}")
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
        print(f"Error generating topic from text: {str(e)}")
        return "Document Content"
