DIFFICULTY_ORDER = {"easy": 0, "medium": 1, "hard": 2}
RANK_TO_DIFFICULTY = {0: "easy", 1: "medium", 2: "hard"}


def _difficulty_rank(question):
    return DIFFICULTY_ORDER.get(question.get("difficulty", "medium"), 1)


def _clamp_rank(rank):
    return max(0, min(2, rank))


def _ordered_questions(questions):
    return sorted(questions, key=lambda question: (_difficulty_rank(question), question["id"]))


def _target_difficulty(performance):
    attempts = performance.get("attempts", 0)
    total_questions = max(performance.get("total_questions", 1), 1)
    progress_ratio = attempts / total_questions

    if progress_ratio < 0.34:
        target_rank = 0
    elif progress_ratio < 0.67:
        target_rank = 1
    else:
        target_rank = 2

    readiness_score = performance.get("readiness_score", 0)
    if readiness_score >= 80:
        target_rank += 1
    elif readiness_score < 45:
        target_rank -= 1

    recent_outcomes = performance.get("recent_outcomes", [])
    if len(recent_outcomes) >= 2 and recent_outcomes[-2:] == [True, True]:
        target_rank += 1
    elif len(recent_outcomes) >= 2 and recent_outcomes[-2:] == [False, False]:
        target_rank -= 1

    return RANK_TO_DIFFICULTY[_clamp_rank(target_rank)]


def get_start_question(questions):
    if not questions:
        return None

    ordered = _ordered_questions(questions)
    easy_questions = [question for question in ordered if question.get("difficulty") == "easy"]
    return easy_questions[0] if easy_questions else ordered[0]


def get_next_question(questions, asked_ids, performance):
    if not questions:
        return None

    ordered = _ordered_questions(questions)
    asked_set = set(asked_ids or [])
    unasked = [question for question in ordered if question["id"] not in asked_set]

    if not unasked:
        return None

    target_difficulty = _target_difficulty(performance)
    weak_areas = set(performance.get("weak_areas", []))

    exact_and_weak = [
        question
        for question in unasked
        if question.get("difficulty") == target_difficulty and question.get("concept") in weak_areas
    ]
    if exact_and_weak:
        return exact_and_weak[0]

    exact_difficulty = [
        question for question in unasked if question.get("difficulty") == target_difficulty
    ]
    if exact_difficulty:
        return exact_difficulty[0]

    weak_only = [question for question in unasked if question.get("concept") in weak_areas]
    if weak_only:
        return weak_only[0]

    target_rank = DIFFICULTY_ORDER.get(target_difficulty, 1)
    fallback = sorted(
        unasked,
        key=lambda question: (abs(_difficulty_rank(question) - target_rank), question["id"]),
    )
    return fallback[0]