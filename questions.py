import requests
import html
import random

# 🔹 store questions globally
_cached_questions = []


def fetch_questions(amount=10):
    global _cached_questions

    # avoid refetching
    if _cached_questions:
        return _cached_questions

    url = f"https://opentdb.com/api.php?amount={amount}&type=multiple"
    response = requests.get(url)
    data = response.json()

    questions = []

    for i, item in enumerate(data["results"]):
        # combine options
        options = item["incorrect_answers"] + [item["correct_answer"]]

        # decode HTML
        options = [html.unescape(opt) for opt in options]
        question_text = html.unescape(item["question"])
        correct_answer = html.unescape(item["correct_answer"])

        # shuffle options
        random.shuffle(options)

        # clean category
        concept = item["category"].split(":")[-1].strip()

        question = {
            "id": i,
            "question": question_text,
            "options": options,
            "answer": correct_answer,   # 🔥 VERY IMPORTANT
            "concept": concept,
            "difficulty": item["difficulty"]
        }

        questions.append(question)

    _cached_questions = questions
    return questions


# 🔒 send safe version to frontend
def sanitize_question(q):
    return {
        "id": q["id"],
        "question": q["question"],
        "options": q["options"],
        "concept": q["concept"],
        "difficulty": q["difficulty"]
    }


# 🔍 get FULL question (with answer)
def get_question_by_id(qid):
    for q in _cached_questions:
        if q["id"] == qid:
            return q   # ✅ MUST return full object
    return None