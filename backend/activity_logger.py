from datetime import datetime
from pathlib import Path


LOG_FILE = Path("activity.log")


def log_activity(message: str):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_entry = f"[{timestamp}] [LOCAL] {message}\n"

    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)


def get_logs():

    if not LOG_FILE.exists():
        return []

    with open(LOG_FILE, "r", encoding="utf-8") as file:
        return file.readlines()