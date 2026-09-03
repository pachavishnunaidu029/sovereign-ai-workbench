from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pytesseract
from PIL import Image
import io
import requests
import json

from report_generator import generate_inspection_report
from model_router import select_model
from sandbox import run_python_code
from rag import search_documents
from activity_logger import log_activity, get_logs


# --------------------------------------------------
# FastAPI Application
# --------------------------------------------------

app = FastAPI(
    title="Sovereign AI Workbench",
    description="Local AI backend for confidential industrial workflows",
    version="0.1.0"
)


# --------------------------------------------------
# Directories
# --------------------------------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

REPORT_DIR = Path("generated_reports")
REPORT_DIR.mkdir(exist_ok=True)


# --------------------------------------------------
# Allowed File Types
# --------------------------------------------------

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}


# --------------------------------------------------
# Tesseract Configuration
# --------------------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Sovereign AI Backend is running",
        "status": "online"
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "environment": "local"
    }


# --------------------------------------------------
# Upload Document
# --------------------------------------------------

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


# --------------------------------------------------
# OCR Endpoint
# --------------------------------------------------

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

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        all_text = []

        for page_number, page in enumerate(pdf):

            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2)
            )

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


# --------------------------------------------------
# AI Text Analysis
# --------------------------------------------------

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

        log_activity("AI text analysis completed using local AI model")

    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    return {
        "status": "success",
        "model": "qwen2.5:1.5b",
        "processing_mode": "local",
        "analysis": result.get("response", "")
    }


# --------------------------------------------------
# Inspection + OCR + AI
# --------------------------------------------------

@app.post("/api/inspect")
async def inspect_document(file: UploadFile = File(...)):

    contents = await file.read()

    # Step 1: OCR
    if file.content_type in {"image/png", "image/jpeg"}:

        image = Image.open(
            io.BytesIO(contents)
        )

        extracted_text = pytesseract.image_to_string(image)

        pages_processed = 1

    elif file.content_type == "application/pdf":

        import fitz

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        all_text = []

        for page_number, page in enumerate(pdf):

            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2)
            )

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


    # Step 2: Local LLM
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


    # Step 3: Return result

    return {
        "status": "success",
        "filename": file.filename,
        "file_type": file.content_type,
        "pages_processed": pages_processed,
        "text_length": len(extracted_text),
        "extracted_text": extracted_text,
        "model": "qwen2.5:1.5b",
        "processing_mode": "local",
        "ai_analysis": result.get("response", "")
    }


# --------------------------------------------------
# Structured Inspection + Word Report
# --------------------------------------------------

@app.post("/api/inspect/structured")
async def inspect_document_structured(
    file: UploadFile = File(...)
):

    print("DEBUG: inspect/structured started")

    contents = await file.read()


    # --------------------------------------------------
    # Step 1: OCR
    # --------------------------------------------------

    if file.content_type in {"image/png", "image/jpeg"}:

        image = Image.open(
            io.BytesIO(contents)
        )

        extracted_text = pytesseract.image_to_string(image)

        pages_processed = 1


    elif file.content_type == "application/pdf":

        import fitz

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        all_text = []

        for page_number, page in enumerate(pdf):

            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2)
            )

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


    # --------------------------------------------------
    # Step 2: Ask Local LLM for Structured Information
    # --------------------------------------------------

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
                "stream": False,
                "format": "json"
            },
            timeout=120
        )

        if response.status_code != 200:

            return {
                "status": "error",
                "message": "Local LLM request failed"
            }

        result = response.json()

        ai_response = result.get(
            "response",
            ""
        ).strip()


    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }


    # --------------------------------------------------
    # Step 3: Convert LLM Response to JSON
    # --------------------------------------------------

    try:

        structured_analysis = json.loads(
            ai_response
        )

    except json.JSONDecodeError:

        return {
            "status": "error",
            "message": "Local LLM did not return valid JSON",
            "raw_response": ai_response
        }


    # --------------------------------------------------
    # Step 4: Generate Word Report
    # --------------------------------------------------

    try:

        report_path = generate_inspection_report(
            file.filename,
            structured_analysis
        )

        log_activity(
            f"Word inspection report generated: {report_path}"
        )

    except Exception as e:

        return {
            "status": "error",
            "message": "Word report generation failed",
            "error_type": type(e).__name__,
            "error": str(e)
        }


    # --------------------------------------------------
    # Step 5: Return Complete Result
    # --------------------------------------------------

    return {
        "status": "success",
        "filename": file.filename,
        "file_type": file.content_type,
        "pages_processed": pages_processed,
        "text_length": len(extracted_text),
        "model": "qwen2.5:1.5b",
        "processing_mode": "local",
        "analysis": structured_analysis,
        "report_path": report_path
    }


# --------------------------------------------------
# Automatic Model Selection
# --------------------------------------------------

@app.post("/api/model/select")
async def select_ai_model(task: str):

    result = select_model(task)

    return {
        "status": "success",
        "task": task,
        "task_type": result["task_type"],
        "selected_model": result["model"],
        "processing_mode": "local"
    }


# --------------------------------------------------
# Execute Task Using Automatically Selected Model
# --------------------------------------------------

@app.post("/api/agent/run")
async def run_agent(task: str):

    # Step 1: Select the appropriate model
    routing_result = select_model(task)

    selected_model = routing_result["model"]
    task_type = routing_result["task_type"]

    # Step 2: Send task to selected local model
    prompt = f"""
You are an AI assistant inside a sovereign, on-premise AI workbench.

Task Type:
{task_type}

User Task:
{task}

Perform the task accurately and provide a useful response.
Do not use external services.
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": selected_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:

            return {
                "status": "error",
                "message": "Selected local model failed"
            }

        result = response.json()

    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    # Step 3: Return result

    return {
        "status": "success",
        "task": task,
        "task_type": task_type,
        "selected_model": selected_model,
        "processing_mode": "local",
        "response": result.get("response", "")
    }


# --------------------------------------------------
# Simple Agent Workflow
# --------------------------------------------------

@app.post("/api/agent/workflow")
async def agent_workflow(task: str):

    # Step 1: Select model
    routing_result = select_model(task)

    selected_model = routing_result["model"]
    task_type = routing_result["task_type"]

    # Step 2: Execute task
    prompt = f"""
You are an AI agent inside a sovereign on-premise AI workbench.

Task Type:
{task_type}

User Task:
{task}

Perform the task accurately.

Return:
1. The main result
2. Important details
3. Any assumptions made
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": selected_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:

            return {
                "status": "error",
                "message": "AI execution failed"
            }

        result = response.json()

    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    # Step 3: Verify that a response was generated
    ai_response = result.get("response", "").strip()

    if not ai_response:
        verification = "FAILED"
    else:
        verification = "PASSED"

    # Step 4: Return complete workflow result
    return {
        "status": "success",
        "workflow": [
            "Task received",
            "Model selected",
            "Task executed locally",
            "Response verified"
        ],
        "task": task,
        "task_type": task_type,
        "selected_model": selected_model,
        "processing_mode": "local",
        "verification": verification,
        "response": ai_response
    }


# --------------------------------------------------
# Coding Agent with Sandbox Verification
# --------------------------------------------------

@app.post("/api/agent/code")
async def coding_agent(task: str):

    log_activity(f"Coding task received: {task}")

    # Step 1: Select model
    routing_result = select_model(task)

    selected_model = routing_result["model"]

    log_activity(f"Coding model selected: {selected_model}")

    # Make sure the coding model is selected
    if selected_model != "qwen2.5-coder:1.5b":

        return {
            "status": "error",
            "message": "This endpoint is only for coding tasks."
        }

    # Step 2: Ask coding model to generate Python code
    prompt = f"""
You are a coding agent inside a sovereign on-premise AI workbench.

Generate Python code for the following task:

{task}

IMPORTANT:
- Return ONLY Python code.
- Do not use markdown.
- Do not use external libraries.
- The program must print the final answer.
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": selected_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:

            return {
                "status": "error",
                "message": "Coding model failed"
            }

        result = response.json()

    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    # Step 3: Get generated code
    generated_code = result.get(
        "response",
        ""
    ).strip()

    # Remove markdown code fences if the model adds them
    if generated_code.startswith("```python"):
        generated_code = generated_code[9:]

    if generated_code.startswith("```"):
        generated_code = generated_code[3:]

    if generated_code.endswith("```"):
        generated_code = generated_code[:-3]

    generated_code = generated_code.strip()

    # Step 4: Execute generated code in sandbox
    sandbox_result = run_python_code(generated_code)

    log_activity(
        f"Sandbox execution completed: {sandbox_result['status']}"
    )

    log_activity("Coding workflow completed")

    # Step 5: Return complete result
    return {
        "status": "success",
        "task": task,
        "selected_model": selected_model,
        "processing_mode": "local",
        "generated_code": generated_code,
        "sandbox_status": sandbox_result["status"],
        "execution_output": sandbox_result["output"],
        "execution_error": sandbox_result["error"]
    }


# --------------------------------------------------
# End-to-End Industrial Inspection Agent
# --------------------------------------------------

@app.post("/api/agent/inspection")
async def inspection_agent(file: UploadFile = File(...)):

    log_activity(
        f"Inspection workflow started: {file.filename}"
    )

    # Step 1: Read uploaded file
    file_content = await file.read()

    # Save temporary upload
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    file_path = upload_dir / file.filename

    with open(file_path, "wb") as f:
        f.write(file_content)

    # Step 2: Perform OCR
    try:

        if file.filename.lower().endswith(".pdf"):

            import fitz

            pdf = fitz.open(file_path)

            extracted_text = ""

            for page in pdf:

                pix = page.get_pixmap()

                image_bytes = pix.tobytes("png")

                image = Image.open(
                    io.BytesIO(image_bytes)
                )

                text = pytesseract.image_to_string(
                    image
                )

                extracted_text += text + "\n"

            pdf.close()

        else:

            image = Image.open(file_path)

            extracted_text = pytesseract.image_to_string(
                image
            )

    except Exception as e:

        return {
            "status": "error",
            "step": "OCR",
            "message": str(e)
        }

    log_activity(
        f"OCR completed: {file.filename}"
    )

    # Step 3: Select industrial inspection model
    routing_result = select_model(
        "Analyze industrial inspection report"
    )

    selected_model = routing_result["model"]

    log_activity(
        f"Inspection model selected: {selected_model}"
    )

    # Step 4: Analyze OCR text using local AI
    prompt = f"""
You are an industrial inspection AI assistant.

Analyze the following inspection report.

Extract:

1. Key findings
2. Recommended actions
3. Overall assessment

Return ONLY valid JSON in this format:

{{
    "key_findings": [],
    "recommended_actions": [],
    "overall_assessment": ""
}}

Inspection Report:

{extracted_text}
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": selected_model,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=120
        )

        if response.status_code != 200:

            return {
                "status": "error",
                "step": "AI Analysis",
                "message": "Local AI model failed"
            }

        ai_result = response.json()

        structured_analysis = json.loads(
            ai_result.get(
                "response",
                "{}"
            )
        )

        log_activity(
            "Industrial inspection analysis completed locally"
        )

    except Exception as e:

        return {
            "status": "error",
            "step": "AI Analysis",
            "message": str(e)
        }

    # Step 5: Generate Word report
    try:

        report_path = generate_inspection_report(
            file.filename,
            structured_analysis
        )

        # FIXED: log Word report generation
        log_activity(
            f"Word inspection report generated: {report_path}"
        )

    except Exception as e:

        return {
            "status": "error",
            "step": "Report Generation",
            "message": str(e)
        }

    # Step 6: Verify report
    report_exists = Path(report_path).exists()

    if report_exists:

        verification = "PASSED"

    else:

        verification = "FAILED"

    log_activity(
        "Inspection workflow completed successfully"
    )

    # Step 7: Return complete workflow
    return {
        "status": "success",

        "workflow": [
            "Document uploaded",
            "OCR completed",
            "Industrial inspection model selected",
            "Inspection analyzed locally",
            "Word report generated",
            "Report verified"
        ],

        "filename": file.filename,

        "model": selected_model,

        "processing_mode": "local",

        "ocr_text_length": len(extracted_text),

        "analysis": structured_analysis,

        "report_path": report_path,

        "verification": verification
    }


# --------------------------------------------------
# Local RAG Question Answering
# --------------------------------------------------

@app.post("/api/rag/query")
async def rag_query(query: str):

    log_activity(
        f"RAG query received: {query}"
    )

    # Step 1: Search local knowledge base
    results = search_documents(query)

    if not results:

        return {
            "status": "success",
            "query": query,
            "message": "No relevant documents found.",
            "processing_mode": "local"
        }

    # Step 2: Use the best matching document
    best_result = results[0]

    log_activity(
        f"Local document retrieved: {best_result['filename']}"
    )

    context = best_result["text"]

    # Step 3: Ask local AI using retrieved context
    prompt = f"""
You are an AI assistant operating inside a sovereign
on-premise industrial AI workbench.

Answer the user's question using ONLY the information
provided in the internal document below.

Internal Document:
{context}

User Question:
{query}

If the answer is not present in the document,
say that the information was not found in the
internal document.

Answer clearly and concisely.
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
                "message": "Local AI model failed"
            }

        result = response.json()

    except requests.RequestException as e:

        return {
            "status": "error",
            "message": "Could not connect to local Ollama server",
            "details": str(e)
        }

    log_activity(
        "RAG answer generated by local AI model"
    )

    log_activity(
        "RAG workflow completed"
    )

    # Step 4: Return answer and source
    return {
        "status": "success",
        "query": query,
        "source_document": best_result["filename"],
        "retrieval_score": best_result["score"],
        "processing_mode": "local",
        "answer": result.get("response", "")
    }


# --------------------------------------------------
# Activity Logs
# --------------------------------------------------

@app.get("/api/logs")
async def activity_logs():

    return {
        "status": "success",
        "processing_mode": "local",
        "logs": get_logs()
    }