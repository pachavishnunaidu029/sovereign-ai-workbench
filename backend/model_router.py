# Model Router
# Selects the appropriate local AI model based on the task.


def select_model(task: str):

    task = task.lower()

    # Industrial inspection / document analysis
    inspection_keywords = [
        "inspection",
        "inspect",
        "industrial",
        "maintenance",
        "equipment",
        "report",
        "findings",
        "safety",
        "p&id",
        "pid"
    ]

    # Coding / programming tasks
    coding_keywords = [
        "code",
        "coding",
        "program",
        "python",
        "java",
        "javascript",
        "function",
        "debug",
        "algorithm",
        "script"
    ]

    # Check for coding task
    if any(keyword in task for keyword in coding_keywords):
        return {
            "task_type": "coding",
            "model": "qwen2.5-coder:1.5b"
        }

    # Check for inspection task
    if any(keyword in task for keyword in inspection_keywords):
        return {
            "task_type": "industrial_inspection",
            "model": "qwen2.5:1.5b"
        }

    # Default model
    return {
        "task_type": "general",
        "model": "qwen2.5:1.5b"
    }