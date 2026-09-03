import subprocess
import sys
import tempfile
from pathlib import Path
import re


def extract_python_code(text: str):

    # If the model returned a Markdown Python code block
    match = re.search(
        r"```python\s*(.*?)```",
        text,
        re.DOTALL | re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    # If it returned a generic code block
    match = re.search(
        r"```\s*(.*?)```",
        text,
        re.DOTALL
    )

    if match:
        return match.group(1).strip()

    # Otherwise try to find the beginning of Python code
    lines = text.splitlines()

    python_lines = []

    for line in lines:

        stripped = line.strip()

        if (
            stripped.startswith("import ")
            or stripped.startswith("from ")
            or "=" in line
            or stripped.startswith("print(")
            or stripped.startswith("#")
        ):
            python_lines.append(line)

    if python_lines:
        return "\n".join(python_lines)

    return text.strip()


def run_python_code(code: str):

    # Extract actual Python code from AI response
    code = extract_python_code(code)

    # Create a temporary Python file
    with tempfile.TemporaryDirectory() as temp_dir:

        code_file = Path(temp_dir) / "generated_code.py"

        code_file.write_text(
            code,
            encoding="utf-8"
        )

        try:

            result = subprocess.run(
                [sys.executable, str(code_file)],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:

                return {
                    "status": "PASSED",
                    "output": result.stdout.strip(),
                    "error": ""
                }

            return {
                "status": "FAILED",
                "output": result.stdout.strip(),
                "error": result.stderr.strip()
            }

        except subprocess.TimeoutExpired:

            return {
                "status": "FAILED",
                "output": "",
                "error": "Execution timed out after 10 seconds."
            }

        except Exception as e:

            return {
                "status": "FAILED",
                "output": "",
                "error": str(e)
            }