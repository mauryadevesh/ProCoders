import hashlib

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from database import store
from tracker import (
    finalize_session,
    get_active_snapshot,
    get_dashboard,
    start_session,
    update_stats,
)
from questions import (
    build_explanation,
    fetch_questions,
    get_question_by_id,
    get_subject,
    get_subjects,
    sanitize_question,
)
from selector import get_next_question, get_start_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_quizzes = {}


class AuthRequest(BaseModel):
    username: str
    password: str
    name: str | None = None


class StartQuizRequest(BaseModel):
    user_id: str
    subject_id: str
    amount: int = 12


class AnswerRequest(BaseModel):
    user_id: str
    question_id: int
    selected: str
    time_taken: float


def _normalize_username(raw_username):
    return raw_username.strip().lower()


def _hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _public_user_record(user):
    return {"id": user["username"], "name": user["name"]}


def _get_user(username):
    normalized_username = _normalize_username(username)
    return store.get_user(normalized_username)


def _ensure_user(user_id):
    username = _normalize_username(user_id)
    user = _get_user(username)
    if user:
        return user

    default_user = {
        "username": username,
        "password_hash": _hash_password(""),
        "name": username.replace("_", " ").title(),
    }
    store.create_user(default_user)
    created_user = _get_user(username)
    if created_user:
        return created_user

    raise HTTPException(status_code=500, detail="Could not initialize user.")


@app.get("/")
def home():
    return {
        "message": "Backend running",
        "persistence": "mongodb" if store.enabled else "in-memory",
    }


@app.get("/subjects")
def subjects_list():
    return {"subjects": get_subjects()}


@app.post("/auth/signup")
def signup(data: AuthRequest):
    username = _normalize_username(data.username)
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(data.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
    if _get_user(username):
        raise HTTPException(status_code=409, detail="Username already exists.")

    user_document = {
        "username": username,
        "password_hash": _hash_password(data.password),
        "name": data.name.strip() if data.name else username.title(),
    }
    created = store.create_user(user_document)
    if not created:
        raise HTTPException(status_code=409, detail="Username already exists.")

    created_user = _get_user(username)
    if not created_user:
        raise HTTPException(status_code=500, detail="Could not create user.")

    return {"user": _public_user_record(created_user)}


@app.post("/auth/login")
def login(data: AuthRequest):
    username = _normalize_username(data.username)
    user = _get_user(username)

    if not user or user.get("password_hash") != _hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    return {"user": _public_user_record(user)}


@app.post("/start")
def start_quiz(data: StartQuizRequest):
    user = _ensure_user(data.user_id)

    subject = get_subject(data.subject_id)
    if not subject:
        raise HTTPException(status_code=400, detail="Invalid subject selected.")

    amount = max(6, min(data.amount, 20))
    questions = fetch_questions(data.subject_id, amount=amount, force_refresh=True)

    if not questions:
        raise HTTPException(status_code=503, detail="Could not fetch questions right now.")

    first_question = get_start_question(questions)

    if not first_question:
        raise HTTPException(status_code=404, detail="No questions available.")

    active_quizzes[user["username"]] = {
        "subject_id": data.subject_id,
        "subject_name": subject["name"],
        "questions": questions,
        "asked_ids": {first_question["id"]},
    }

    start_session(user["username"], data.subject_id, subject["name"], len(questions))

    return {
        "question": sanitize_question(first_question),
        "total_questions": len(questions),
        "served_questions": 1,
        "analytics": get_active_snapshot(user["username"]),
        "subject": {
            "id": data.subject_id,
            "name": subject["name"],
        },
    }


@app.post("/answer")
def submit_answer(data: AnswerRequest):
    user = _ensure_user(data.user_id)
    user_id = user["username"]

    active_quiz = active_quizzes.get(user_id)
    if not active_quiz:
        raise HTTPException(status_code=404, detail="No active quiz. Please start a quiz first.")

    question = get_question_by_id(active_quiz["questions"], data.question_id)

    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    is_correct = data.selected == question["answer"]

    active_quiz["asked_ids"].add(data.question_id)

    analytics = update_stats(user_id, question, is_correct, data.time_taken)

    next_question = get_next_question(active_quiz["questions"], active_quiz["asked_ids"], analytics)

    if next_question:
        active_quiz["asked_ids"].add(next_question["id"])

    completed = next_question is None
    session_summary = finalize_session(user_id) if completed else None

    if completed:
        active_quizzes.pop(user_id, None)

    explanation = build_explanation(question, data.selected) if not is_correct else None

    return {
        "correct": is_correct,
        "next_question": sanitize_question(next_question),
        "completed": completed,
        "analytics": analytics,
        "remaining_questions": max(
            len(active_quiz["questions"]) - len(active_quiz["asked_ids"]),
            0,
        ) if not completed else 0,
        "session_summary": session_summary,
        "explanation": explanation,
    }


@app.get("/dashboard/{user_id}")
def dashboard(user_id: str):
    user = _ensure_user(user_id)
    return get_dashboard(user["username"])