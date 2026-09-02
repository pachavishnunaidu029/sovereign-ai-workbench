from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pytesseract
from PIL import Image
import io
import requests

app = FastAPI(
    title="Sovereign AI Workbench",
    description="Local AI backend for confidential industrial workflows",
    version="0.1.0"
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Sovereign AI Backend is running",
        "status": "online"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "environment": "local"
    }


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        return {
            "status": "error",
            "message": "Unsupported file type"
        }

    file_path = UPLOAD_DIR / file.filename

    file_size = 0

    with open(file_path, "wb") as buffer:
        while content := await file.read(1024 * 1024):
            buffer.write(content)
            file_size += len(content)

    return {
        "status": "success",
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": file_size,
        "message": "Document uploaded and stored locally"
    }


@app.post("/api/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    contents = await file.read()

    # Handle images
    if file.content_type in {"image/png", "image/jpeg"}:
        image = Image.open(io.BytesIO(contents))
        text = pytesseract.image_to_string(image)

        return {
            "status": "success",
            "filename": file.filename,
            "file_type": "image",
            "text_length": len(text),
            "extracted_text": text
            }
    
    # Handle PDFs
    elif file.content_type == "application/pdf":
        import fitz

        pdf = fitz.open(stream=contents, filetype="pdf")

        all_text = []

        for page_number, page in enumerate(pdf):
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

            image = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )

            text = pytesseract.image_to_string(image)

            all_text.append(
                f"\n--- Page {page_number + 1} ---\n{text}"
            )

        pdf.close()

        extracted_text = "\n".join(all_text)

        return {
            "status": "success",
            "filename": file.filename,
            "file_type": "pdf",
            "pages_processed": len(all_text),
            "text_length": len(extracted_text),
            "extracted_text": extracted_text
            }

    else:
        return {
            "status": "error",
            "message": "OCR supports PNG, JPEG and PDF files"
        }

@app.post("/api/ai/analyze")
async def analyze_text(text: str):
    ollama_url = "http://localhost:11434/api/generate"

    prompt = f"""
You are an AI assistant for confidential industrial inspection work.

Analyze the following inspection text.

Return:
1. Key Findings
2. Recommended Actions
3. Overall Assessment

Inspection Text:
{text}
"""

    response = requests.post(
        ollama_url,
        json={
            "model": "qwen2.5:1.5b",
            "prompt": prompt,
            "stream": False
        }
    )

    if response.status_code != 200:
        return {
            "status": "error",
            "message": "Local LLM request failed"
        }

    result = response.json()

    return {
        "status": "success",
        "model": "qwen2.5:1.5b",
        "analysis": result.get("response", "")
    }

@app.post("/api/inspect")
async def inspect_document(file: UploadFile = File(...)):
    contents = await file.read()

    # Step 1: Extract text using OCR
    if file.content_type in {"image/png", "image/jpeg"}:
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image)
        pages_processed = 1

    elif file.content_type == "application/pdf":
        import fitz

        pdf = fitz.open(stream=contents, filetype="pdf")
        all_text = []

        for page_number, page in enumerate(pdf):
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

            image = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )

            text = pytesseract.image_to_string(image)

            all_text.append(
                f"\n--- Page {page_number + 1} ---\n{text}"
            )

        pdf.close()

        extracted_text = "\n".join(all_text)
        pages_processed = len(all_text)

    else:
        return {
            "status": "error",
            "message": "Only PNG, JPEG and PDF files are supported"
        }

    # Step 2: Send OCR text to local LLM
    ollama_url = "http://localhost:11434/api/generate"

    prompt = f"""
You are an AI assistant for confidential industrial inspection work.

Analyze the following inspection report.

Provide:
1. Key Findings
2. Recommended Actions
3. Overall Assessment

Be concise and focus only on information present in the report.

Inspection Report:
{extracted_text}
"""

    try:
        response = requests.post(
            ollama_url,
            json={
                "model": "qwen2.5:1.5b",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:
            return {
                "status": "error",
                "message": "Local LLM request failed"
            }

        result = response.json()

    except requests.RequestException as e:
        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    # Step 3: Return complete result
    return {
        "status": "success",
        "filename": file.filename,
        "file_type": file.content_type,
        "pages_processed": pages_processed,
        "text_length": len(extracted_text),
        "extracted_text": extracted_text,
        "model": "qwen2.5:1.5b",
        "ai_analysis": result.get("response", "")
    }

@app.post("/api/inspect/structured")
async def inspect_document_structured(file: UploadFile = File(...)):
    contents = await file.read()

    # Step 1: OCR
    if file.content_type in {"image/png", "image/jpeg"}:
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image)
        pages_processed = 1

    elif file.content_type == "application/pdf":
        import fitz

        pdf = fitz.open(stream=contents, filetype="pdf")
        all_text = []

        for page_number, page in enumerate(pdf):
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

            image = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )

            text = pytesseract.image_to_string(image)

            all_text.append(
                f"\n--- Page {page_number + 1} ---\n{text}"
            )

        pdf.close()

        extracted_text = "\n".join(all_text)
        pages_processed = len(all_text)

    else:
        return {
            "status": "error",
            "message": "Only PNG, JPEG and PDF files are supported"
        }

    # Step 2: Ask local LLM for structured information
    prompt = f"""
You are an AI assistant for confidential industrial inspection work.

Analyze the following industrial inspection report.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside the JSON.

Use exactly this structure:

{{
  "key_findings": [
    "finding 1",
    "finding 2"
  ],
  "recommended_actions": [
    "action 1",
    "action 2"
  ],
  "overall_assessment": "short assessment"
}}

Only include information supported by the inspection report.

Inspection Report:
{extracted_text}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:1.5b",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:
            return {
                "status": "error",
                "message": "Local LLM request failed"
            }

        result = response.json()
        ai_response = result.get("response", "").strip()

    except requests.RequestException as e:
        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    # Step 3: Convert LLM response into JSON
    import json

    try:
        structured_analysis = json.loads(ai_response)
    except json.JSONDecodeError:
        return {
            "status": "error",
            "message": "Local LLM did not return valid JSON",
            "raw_response": ai_response
        }

    # Step 4: Return structured result
    return {
        "status": "success",
        "filename": file.filename,
        "file_type": file.content_type,
        "pages_processed": pages_processed,
        "text_length": len(extracted_text),
        "model": "qwen2.5:1.5b",
        "analysis": structured_analysis
    }