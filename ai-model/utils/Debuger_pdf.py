import PyPDF2 # type: ignore
from io import BytesIO

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
    