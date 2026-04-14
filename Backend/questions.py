import html
import random
import time

import requests


SUBJECTS = {
    "computer_science": {
        "name": "Computer Science",
        "description": "Programming logic, software systems, and CS fundamentals",
        "categories": [18],
        "fallback_concepts": ["Algorithms", "Programming", "Systems"],
    },
    "mathematics": {
        "name": "Mathematics",
        "description": "Arithmetic, algebra, probability, and quantitative reasoning",
        "categories": [19],
        "fallback_concepts": ["Algebra", "Numeracy", "Logic"],
    },
    "science": {
        "name": "Science & Nature",
        "description": "Physics, biology, chemistry, and scientific thinking",
        "categories": [17],
        "fallback_concepts": ["Physics", "Biology", "Chemistry"],
    },
    "general_knowledge": {
        "name": "General Knowledge",
        "description": "Mixed high-value trivia for broad readiness",
        "categories": [9],
        "fallback_concepts": ["Culture", "History", "Reasoning"],
    },
    "history": {
        "name": "History",
        "description": "Ancient to modern world history, events, and civilizations",
        "categories": [23],
        "fallback_concepts": ["Ancient", "Modern", "Events"],
    },
    "geography": {
        "name": "Geography",
        "description": "Countries, capitals, maps, and world regions",
        "categories": [22],
        "fallback_concepts": ["Countries", "Capitals", "Regions"],
    },
}

CONCEPT_KEYWORDS = {
    "computer_science": {
        "Algorithms": ["algorithm", "complexity", "sort", "search", "tree", "graph"],
        "Programming": ["python", "java", "javascript", "function", "variable", "compile"],
        "Systems": ["cpu", "memory", "network", "protocol", "database", "linux"],
    },
    "mathematics": {
        "Algebra": ["equation", "algebra", "solve", "polynomial", "x", "linear"],
        "Numeracy": ["percent", "ratio", "fraction", "decimal", "average", "sum"],
        "Logic": ["prime", "probability", "theorem", "geometry", "matrix", "proof"],
    },
    "science": {
        "Physics": ["force", "energy", "motion", "gravity", "velocity", "electric"],
        "Biology": ["cell", "dna", "organism", "species", "enzyme", "evolution"],
        "Chemistry": ["atom", "molecule", "acid", "base", "reaction", "element"],
    },
    "general_knowledge": {
        "Culture": ["music", "movie", "art", "book", "author", "film"],
        "History": ["war", "year", "empire", "king", "historic", "revolution"],
        "Reasoning": ["capital", "country", "currency", "language", "continent"],
    },
    "history": {
        "Ancient": ["empire", "pharaoh", "roman", "greek", "dynasty", "medieval"],
        "Modern": ["world war", "independence", "industrial", "treaty", "president"],
        "Events": ["battle", "revolution", "timeline", "century", "historic"],
    },
    "geography": {
        "Countries": ["country", "nation", "border", "flag", "population", "city"],
        "Capitals": ["capital", "province", "state", "government", "seat"],
        "Regions": ["continent", "ocean", "desert", "mountain", "river", "island"],
    },
}

_cached_questions = {}
MAX_FETCH_RETRIES = 3
BASE_RETRY_DELAY_SECONDS = 0.8
DIFFICULTY_LEVELS = ("easy", "medium", "hard")


def get_subjects():
    return [
        {
            "id": subject_id,
            "name": config["name"],
            "description": config["description"],
        }
        for subject_id, config in SUBJECTS.items()
    ]


def get_subject(subject_id):
    return SUBJECTS.get(subject_id)


def _clone_questions(questions):
    return [{**question, "options": list(question["options"])} for question in questions]


def _infer_concept(subject_id, question_text, index):
    normalized_text = question_text.lower()
    concept_map = CONCEPT_KEYWORDS.get(subject_id, {})

    for concept_name, keywords in concept_map.items():
        if any(keyword in normalized_text for keyword in keywords):
            return concept_name

    fallback_concepts = SUBJECTS[subject_id]["fallback_concepts"]
    return fallback_concepts[index % len(fallback_concepts)]


def _fetch_trivia_results(url, retries=MAX_FETCH_RETRIES):
    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            payload = response.json()

            if payload.get("response_code") == 0:
                return payload.get("results", [])
        except (requests.RequestException, ValueError):
            pass

        if attempt < retries:
            time.sleep(BASE_RETRY_DELAY_SECONDS * attempt)

    return []


def _build_offline_questions(subject_id, amount):
    total = max(6, min(amount, 20))
    subject_name = SUBJECTS[subject_id]["name"]
    concepts = SUBJECTS[subject_id]["fallback_concepts"]
    questions = []

    for index in range(total):
        concept = concepts[index % len(concepts)]

        if index < total / 3:
            difficulty = DIFFICULTY_LEVELS[0]
        elif index < (2 * total) / 3:
            difficulty = DIFFICULTY_LEVELS[1]
        else:
            difficulty = DIFFICULTY_LEVELS[2]

        correct_answer = f"{concept} fundamentals"
        options = [
            correct_answer,
            f"Unrelated detail {index + 1}",
            f"{subject_name} myth {index + 1}",
            f"{concept} confusion",
        ]
        random.shuffle(options)

        questions.append(
            {
                "id": index,
                "question": f"[Offline fallback] In {subject_name}, which option best matches {concept}?",
                "options": options,
                "answer": correct_answer,
                "concept": concept,
                "difficulty": difficulty,
                "subject_id": subject_id,
            }
        )

    return questions


def fetch_questions(subject_id="computer_science", amount=12, force_refresh=False):
    resolved_subject = subject_id if subject_id in SUBJECTS else "computer_science"
    cache_key = (resolved_subject, amount)

    if cache_key in _cached_questions and not force_refresh:
        return _clone_questions(_cached_questions[cache_key])

    category_id = random.choice(SUBJECTS[resolved_subject]["categories"])
    url = f"https://opentdb.com/api.php?amount={amount}&type=multiple&category={category_id}"
    results = _fetch_trivia_results(url)

    if not results:
        if cache_key in _cached_questions:
            return _clone_questions(_cached_questions[cache_key])

        offline_questions = _build_offline_questions(resolved_subject, amount)
        _cached_questions[cache_key] = offline_questions
        return _clone_questions(offline_questions)

    questions = []

    for index, item in enumerate(results):
        options = item.get("incorrect_answers", []) + [item.get("correct_answer", "")]
        options = [html.unescape(option) for option in options]

        question_text = html.unescape(item.get("question", ""))
        correct_answer = html.unescape(item.get("correct_answer", ""))

        random.shuffle(options)

        concept = _infer_concept(resolved_subject, question_text, index)
        difficulty = item.get("difficulty", "medium")

        questions.append(
            {
                "id": index,
                "question": question_text,
                "options": options,
                "answer": correct_answer,
                "concept": concept,
                "difficulty": difficulty,
                "subject_id": resolved_subject,
            }
        )

    _cached_questions[cache_key] = questions
    return _clone_questions(questions)


def sanitize_question(question):
    if not question:
        return None

    return {
        "id": question["id"],
        "question": question["question"],
        "options": question["options"],
        "concept": question["concept"],
        "difficulty": question["difficulty"],
        "subject_id": question.get("subject_id"),
    }


def get_question_by_id(questions, question_id):
    for question in questions:
        if question["id"] == question_id:
            return question
    return None


def build_explanation(question, selected_option):
    if not question:
        return "Review the concept and try again."

    if selected_option == question["answer"]:
        return f"Great work. {question['answer']} is correct for this {question['concept']} concept."

    return (
        f"Not quite. Focus on {question['concept']} concepts and review this topic's key ideas "
        "before attempting a similar question again."
    )