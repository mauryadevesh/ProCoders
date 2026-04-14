from selector import get_next_question, get_start_question


def build_questions():
    return [
        {"id": 1, "difficulty": "easy", "concept": "Arrays"},
        {"id": 2, "difficulty": "easy", "concept": "Loops"},
        {"id": 3, "difficulty": "medium", "concept": "Recursion"},
        {"id": 4, "difficulty": "medium", "concept": "Databases"},
        {"id": 5, "difficulty": "hard", "concept": "Dynamic Programming"},
        {"id": 6, "difficulty": "hard", "concept": "Graph Theory"},
    ]


def test_get_start_question_prefers_easy():
    questions = build_questions()

    selected = get_start_question(questions)

    assert selected["difficulty"] == "easy"
    assert selected["id"] == 1


def test_get_next_question_steps_up_when_user_is_strong():
    questions = build_questions()
    performance = {
        "attempts": 2,
        "total_questions": 12,
        "readiness_score": 92,
        "recent_outcomes": [True, True],
        "weak_areas": [],
    }

    selected = get_next_question(questions, asked_ids={1, 2, 3, 4}, performance=performance)

    assert selected["difficulty"] == "hard"


def test_get_next_question_steps_down_when_user_struggles():
    questions = build_questions()
    performance = {
        "attempts": 9,
        "total_questions": 12,
        "readiness_score": 30,
        "recent_outcomes": [False, False],
        "weak_areas": [],
    }

    selected = get_next_question(questions, asked_ids={3, 4, 5, 6}, performance=performance)

    assert selected["difficulty"] == "easy"


def test_get_next_question_prioritizes_weak_area_inside_target_difficulty():
    questions = build_questions()
    performance = {
        "attempts": 5,
        "total_questions": 12,
        "readiness_score": 58,
        "recent_outcomes": [True, False],
        "weak_areas": ["Recursion"],
    }

    selected = get_next_question(questions, asked_ids={1, 2}, performance=performance)

    assert selected["difficulty"] == "medium"
    assert selected["concept"] == "Recursion"


def test_get_next_question_returns_none_when_everything_is_asked():
    questions = build_questions()
    performance = {
        "attempts": 12,
        "total_questions": 12,
        "readiness_score": 80,
        "recent_outcomes": [True, True],
        "weak_areas": [],
    }

    selected = get_next_question(questions, asked_ids={1, 2, 3, 4, 5, 6}, performance=performance)

    assert selected is None
