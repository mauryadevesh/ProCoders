from datetime import datetime, timezone

from database import store
from questions import get_subject


CHAPTER_LIBRARY = {
    "computer_science": {
        "Algorithms": [
            {
                "chapter": "Algorithms and Big-O Basics",
                "source": "GeeksforGeeks",
                "url": "https://www.geeksforgeeks.org/analysis-algorithms-big-o-analysis/",
            },
            {
                "chapter": "Algorithms Intro",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/computing/computer-science/algorithms",
            },
        ],
        "Programming": [
            {
                "chapter": "Python Programming Basics",
                "source": "W3Schools",
                "url": "https://www.w3schools.com/python/",
            },
            {
                "chapter": "Programming Foundations",
                "source": "freeCodeCamp",
                "url": "https://www.freecodecamp.org/news/tag/programming/",
            },
        ],
        "Systems": [
            {
                "chapter": "Operating Systems Overview",
                "source": "GeeksforGeeks",
                "url": "https://www.geeksforgeeks.org/operating-systems/",
            },
            {
                "chapter": "Computer Systems",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/computing/computer-science/computers-and-internet",
            },
        ],
        "_general": [
            {
                "chapter": "Computer Science Core Concepts",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/computing/computer-science",
            }
        ],
    },
    "mathematics": {
        "Algebra": [
            {
                "chapter": "Algebra Foundations",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/math/algebra",
            }
        ],
        "Numeracy": [
            {
                "chapter": "Arithmetic and Number Skills",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/math/arithmetic",
            }
        ],
        "Logic": [
            {
                "chapter": "Probability and Statistics",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/math/statistics-probability",
            }
        ],
        "_general": [
            {
                "chapter": "Math Review",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/math",
            }
        ],
    },
    "science": {
        "Physics": [
            {
                "chapter": "Physics Library",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/science/physics",
            }
        ],
        "Biology": [
            {
                "chapter": "Biology Library",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/science/biology",
            }
        ],
        "Chemistry": [
            {
                "chapter": "Chemistry Library",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/science/chemistry",
            }
        ],
        "_general": [
            {
                "chapter": "Science and Nature Overview",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/science",
            }
        ],
    },
    "general_knowledge": {
        "Culture": [
            {
                "chapter": "Arts and Humanities",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/humanities",
            }
        ],
        "History": [
            {
                "chapter": "World History Overview",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/humanities/world-history",
            }
        ],
        "Reasoning": [
            {
                "chapter": "Critical Thinking and Logic",
                "source": "MindTools",
                "url": "https://www.mindtools.com/",
            }
        ],
        "_general": [
            {
                "chapter": "General Knowledge Refresh",
                "source": "Wikipedia",
                "url": "https://en.wikipedia.org/wiki/General_knowledge",
            }
        ],
    },
    "history": {
        "Ancient": [
            {
                "chapter": "Ancient Civilizations",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/humanities/world-history/ancient-medieval",
            }
        ],
        "Modern": [
            {
                "chapter": "Modern World History",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/humanities/world-history",
            }
        ],
        "Events": [
            {
                "chapter": "Major Historical Events",
                "source": "Britannica",
                "url": "https://www.britannica.com/topic/list-of-time-periods-2001851",
            }
        ],
        "_general": [
            {
                "chapter": "History Fundamentals",
                "source": "Khan Academy",
                "url": "https://www.khanacademy.org/humanities/world-history",
            }
        ],
    },
    "geography": {
        "Countries": [
            {
                "chapter": "Countries of the World",
                "source": "National Geographic",
                "url": "https://education.nationalgeographic.org/resource/resource-library-geography/",
            }
        ],
        "Capitals": [
            {
                "chapter": "World Capitals Reference",
                "source": "Britannica",
                "url": "https://www.britannica.com/topic/list-of-capitals-1994452",
            }
        ],
        "Regions": [
            {
                "chapter": "Physical Geography Basics",
                "source": "National Geographic",
                "url": "https://education.nationalgeographic.org/resource/physical-geography/",
            }
        ],
        "_general": [
            {
                "chapter": "Geography Foundations",
                "source": "National Geographic",
                "url": "https://education.nationalgeographic.org/resource/geography/",
            }
        ],
    },
}


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _new_profile():
    return {
        "concept_stats": {},
        "records": [],
        "total_attempts": 0,
        "total_correct": 0,
        "total_time": 0.0,
    }


def _new_session(subject_id, subject_name, total_questions):
    return {
        "subject_id": subject_id,
        "subject_name": subject_name,
        "started_at": _now_iso(),
        "total_questions": total_questions,
        "attempts": 0,
        "correct": 0,
        "total_time": 0.0,
        "concept_stats": {},
        "timeline": [],
        "recent_outcomes": [],
    }


def _speed_score(avg_time):
    if avg_time < 8:
        return 1.0
    if avg_time < 14:
        return 0.85
    if avg_time < 22:
        return 0.65
    return 0.45


def _ensure_profile(user_id):
    profile = store.get_profile(user_id)
    if profile:
        profile.pop("user_id", None)
        profile.pop("updated_at", None)
        return profile

    profile = _new_profile()
    store.save_profile(user_id, profile)
    return profile


def _get_or_create_concept_stat(concept_stats, concept):
    if concept not in concept_stats:
        concept_stats[concept] = {
            "attempts": 0,
            "correct": 0,
            "avg_time": 0.0,
            "mastery": 0.0,
        }
    return concept_stats[concept]


def _update_concept_stats(concept_stats, concept, is_correct, time_taken):
    stat = _get_or_create_concept_stat(concept_stats, concept)
    stat["attempts"] += 1

    if is_correct:
        stat["correct"] += 1

    previous_attempts = stat["attempts"] - 1
    stat["avg_time"] = (
        (stat["avg_time"] * previous_attempts + time_taken) / stat["attempts"]
    )

    accuracy = stat["correct"] / stat["attempts"]
    stat["mastery"] = accuracy * _speed_score(stat["avg_time"])


def _concept_mastery_map(concept_stats):
    return {
        concept: round(values["mastery"] * 100, 2)
        for concept, values in concept_stats.items()
    }


def _rank_concepts(concept_stats, reverse=False):
    ranking = sorted(
        concept_stats.items(),
        key=lambda item: item[1]["mastery"],
        reverse=reverse,
    )
    return [concept for concept, _ in ranking]


def _build_study_plan(weak_areas):
    if not weak_areas:
        return [
            "Keep practicing mixed sets to maintain your current readiness.",
            "Attempt one timed quiz daily to sharpen speed and consistency.",
        ]

    plan = []
    for area in weak_areas[:3]:
        plan.append(f"Practice 8 focused questions on {area} with a 12-second target per question.")
    plan.append("Review incorrect answers and retry after 15 minutes to strengthen retention.")
    return plan


def _peer_band(readiness_score):
    if readiness_score >= 85:
        return "Top 10%"
    if readiness_score >= 70:
        return "Top 25%"
    if readiness_score >= 55:
        return "Top 40%"
    if readiness_score >= 40:
        return "Top 60%"
    return "Building Foundation"


def _lowest_mastery_concepts(concept_mastery, limit=3):
    ranked = sorted(concept_mastery.items(), key=lambda item: item[1])
    return [concept for concept, _ in ranked[:limit]]


def _chapter_action_text(readiness_score):
    if readiness_score < 45:
        return "Read this chapter once more, then solve 8 focused questions."
    if readiness_score < 65:
        return "Revisit key sections once more and solve 5 targeted questions."
    return "Skim this chapter and attempt a short mixed quiz to retain mastery."


def _build_revision_message(readiness_score, weak_areas, subject_name):
    if not weak_areas:
        return (
            f"Your {subject_name} performance is stable. Do a quick chapter skim and keep practicing"
            " mixed quizzes."
        )

    if readiness_score < 55:
        return (
            f"Your readiness in {subject_name} is below target. Re-read the suggested chapters once more"
            " before your next attempt."
        )

    return (
        f"You are improving in {subject_name}. Revisit weak chapters once more to convert them"
        " into strong areas."
    )


def _build_chapter_recommendations(subject_id, subject_name, weak_areas, concept_mastery, readiness_score):
    if not subject_id:
        return []

    chapter_catalog = CHAPTER_LIBRARY.get(subject_id, {})
    if not chapter_catalog:
        return []

    concept_candidates = list(weak_areas[:3])
    if not concept_candidates:
        concept_candidates = _lowest_mastery_concepts(concept_mastery, limit=2)

    if not concept_candidates:
        concept_candidates = [
            concept for concept in chapter_catalog.keys() if concept != "_general"
        ][:2]

    action_text = _chapter_action_text(readiness_score)
    recommendations = []

    for concept in concept_candidates:
        chapter_options = chapter_catalog.get(concept) or chapter_catalog.get("_general", [])
        if not chapter_options:
            continue

        selected_chapter = chapter_options[0]
        mastery_value = concept_mastery.get(concept)

        if mastery_value is None:
            why_text = f"{concept} was flagged during your recent {subject_name} quiz."
        else:
            why_text = f"{concept} mastery is currently {round(mastery_value, 2)}%."

        recommendations.append(
            {
                "subject_id": subject_id,
                "subject_name": subject_name,
                "concept": concept,
                "chapter_title": selected_chapter["chapter"],
                "source": selected_chapter["source"],
                "url": selected_chapter["url"],
                "why": why_text,
                "action": action_text,
            }
        )

    if recommendations:
        return recommendations

    general_options = chapter_catalog.get("_general", [])
    if not general_options:
        return []

    general_chapter = general_options[0]
    return [
        {
            "subject_id": subject_id,
            "subject_name": subject_name,
            "concept": "Core Review",
            "chapter_title": general_chapter["chapter"],
            "source": general_chapter["source"],
            "url": general_chapter["url"],
            "why": "A full chapter review helps stabilize your fundamentals.",
            "action": action_text,
        }
    ]


def start_session(user_id, subject_id, subject_name, total_questions):
    _ensure_profile(user_id)
    session = _new_session(subject_id, subject_name, total_questions)
    store.save_session(user_id, session)


def get_active_snapshot(user_id):
    session = store.get_session(user_id)
    if not session:
        return None

    session.pop("user_id", None)
    session.pop("updated_at", None)

    attempts = session["attempts"]
    accuracy = (session["correct"] / attempts) * 100 if attempts else 0
    avg_time = session["total_time"] / attempts if attempts else 0
    readiness = (accuracy * 0.7) + (_speed_score(avg_time) * 30) if attempts else 0

    concept_mastery = _concept_mastery_map(session["concept_stats"])
    weak_areas = _rank_concepts(session["concept_stats"])[:3]
    strong_areas = _rank_concepts(session["concept_stats"], reverse=True)[:3]

    progress_ratio = attempts / max(session["total_questions"], 1)

    return {
        "subject_id": session["subject_id"],
        "subject_name": session["subject_name"],
        "attempts": attempts,
        "correct": session["correct"],
        "accuracy": round(accuracy, 2),
        "avg_time": round(avg_time, 2),
        "readiness_score": round(readiness, 2),
        "concept_mastery": concept_mastery,
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "recent_outcomes": list(session["recent_outcomes"]),
        "total_questions": session["total_questions"],
        "progress_ratio": round(progress_ratio, 2),
    }


def update_stats(user_id, question, is_correct, time_taken):
    profile = _ensure_profile(user_id)
    session = store.get_session(user_id)

    if session:
        session.pop("user_id", None)
        session.pop("updated_at", None)
    else:
        start_session(user_id, question.get("subject_id", "unknown"), "Unknown", 1)
        session = _new_session(question.get("subject_id", "unknown"), "Unknown", 1)

    concept = question["concept"]
    safe_time = max(float(time_taken), 0.1)

    session["attempts"] += 1
    session["total_time"] += safe_time
    if is_correct:
        session["correct"] += 1

    session["recent_outcomes"].append(bool(is_correct))
    session["recent_outcomes"] = session["recent_outcomes"][-5:]

    _update_concept_stats(session["concept_stats"], concept, is_correct, safe_time)

    profile["total_attempts"] += 1
    profile["total_time"] += safe_time
    if is_correct:
        profile["total_correct"] += 1
    _update_concept_stats(profile["concept_stats"], concept, is_correct, safe_time)

    attempts = session["attempts"]
    accuracy = (session["correct"] / attempts) * 100 if attempts else 0
    avg_time = session["total_time"] / attempts if attempts else 0
    readiness = (accuracy * 0.7) + (_speed_score(avg_time) * 30) if attempts else 0

    session["timeline"].append(
        {
            "step": attempts,
            "readiness": round(readiness, 2),
            "accuracy": round(accuracy, 2),
        }
    )

    store.save_profile(user_id, profile)
    store.save_session(user_id, session)
    return get_active_snapshot(user_id)


def finalize_session(user_id):
    session = store.get_session(user_id)
    if not session:
        return None

    session.pop("user_id", None)
    session.pop("updated_at", None)

    attempts = session["attempts"]
    accuracy = (session["correct"] / attempts) * 100 if attempts else 0
    avg_time = session["total_time"] / attempts if attempts else 0
    readiness_score = (accuracy * 0.7) + (_speed_score(avg_time) * 30) if attempts else 0

    concept_mastery = _concept_mastery_map(session["concept_stats"])
    weak_areas = _rank_concepts(session["concept_stats"])[:3]
    strong_areas = _rank_concepts(session["concept_stats"], reverse=True)[:3]

    summary = {
        "subject_id": session["subject_id"],
        "subject_name": session["subject_name"],
        "completed_at": _now_iso(),
        "attempts": attempts,
        "correct": session["correct"],
        "accuracy": round(accuracy, 2),
        "avg_time": round(avg_time, 2),
        "readiness_score": round(readiness_score, 2),
        "concept_mastery": concept_mastery,
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "timeline": session["timeline"],
    }

    profile = _ensure_profile(user_id)
    profile["records"].append(summary)
    profile["records"] = profile["records"][-30:]

    store.save_profile(user_id, profile)
    store.delete_session(user_id)
    return summary


def get_dashboard(user_id):
    profile = _ensure_profile(user_id)
    concept_mastery = _concept_mastery_map(profile["concept_stats"])

    total_attempts = profile["total_attempts"]
    overall_accuracy = (profile["total_correct"] / total_attempts) * 100 if total_attempts else 0
    overall_avg_time = profile["total_time"] / total_attempts if total_attempts else 0

    weak_areas = _rank_concepts(profile["concept_stats"])[:3]
    strong_areas = _rank_concepts(profile["concept_stats"], reverse=True)[:3]

    latest_readiness = profile["records"][-1]["readiness_score"] if profile["records"] else 0
    latest_record = profile["records"][-1] if profile["records"] else None
    active_session = get_active_snapshot(user_id)

    subject_id = None
    subject_name = "Current subject"
    subject_concept_mastery = {}

    if active_session and active_session.get("subject_id"):
        subject_id = active_session["subject_id"]
        subject_name = active_session.get("subject_name") or subject_name
    elif latest_record:
        subject_id = latest_record.get("subject_id")
        subject_name = latest_record.get("subject_name") or subject_name
        subject_concept_mastery = latest_record.get("concept_mastery", {})

    if subject_id and subject_name == "Current subject":
        subject = get_subject(subject_id)
        subject_name = subject["name"] if subject else "Current subject"

    recommendation_mastery = subject_concept_mastery or concept_mastery
    chapter_recommendations = _build_chapter_recommendations(
        subject_id,
        subject_name,
        weak_areas,
        recommendation_mastery,
        latest_readiness,
    )

    revision_message = _build_revision_message(latest_readiness, weak_areas, subject_name)

    progress = [
        {
            "session": index + 1,
            "subject": record["subject_name"],
            "readiness": record["readiness_score"],
            "accuracy": record["accuracy"],
        }
        for index, record in enumerate(profile["records"])
    ]

    return {
        "performance": {
            "attempts": total_attempts,
            "accuracy": round(overall_accuracy, 2),
            "avg_time": round(overall_avg_time, 2),
            "readiness_score": round(latest_readiness, 2),
        },
        "concept_mastery": concept_mastery,
        "weak_areas": weak_areas,
        "strong_areas": strong_areas,
        "records": list(reversed(profile["records"])),
        "progress": progress,
        "study_plan": _build_study_plan(weak_areas),
        "chapter_recommendations": chapter_recommendations,
        "revision_message": revision_message,
        "peer_band": _peer_band(latest_readiness),
        "active_session": active_session,
        "persistence": "mongodb" if store.enabled else "in-memory",
    }