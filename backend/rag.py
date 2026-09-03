from pathlib import Path


KNOWLEDGE_BASE = Path("knowledge_base")


def load_documents():

    documents = []

    for file_path in KNOWLEDGE_BASE.glob("*.txt"):

        try:

            text = file_path.read_text(
                encoding="utf-8"
            )

            documents.append({
                "filename": file_path.name,
                "text": text
            })

        except Exception:
            continue

    return documents


def search_documents(query: str):

    documents = load_documents()

    query_words = query.lower().split()

    results = []

    for document in documents:

        text_lower = document["text"].lower()

        score = 0

        for word in query_words:

            if word in text_lower:
                score += 1

        if score > 0:

            results.append({
                "filename": document["filename"],
                "score": score,
                "text": document["text"]
            })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results