from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from questions import fetch_questions, sanitize_question, get_question_by_id

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

questions = fetch_questions()


class AnswerRequest(BaseModel):
    question_id: int
    selected: str
    time_taken: float


@app.get("/")
def home():
    return {"message": "Backend running"}


@app.get("/start")
def start_quiz():
    return sanitize_question(questions[0])


@app.post("/answer")
def submit_answer(data: AnswerRequest):
    question = get_question_by_id(data.question_id)

    if not question:
        return {"error": "Question not found"}

    print("DEBUG:", question)  # 🔥 check this

    is_correct = data.selected == question["answer"]

    next_index = (data.question_id + 1) % len(questions)
    next_q = questions[next_index]

    return {
        "correct": is_correct,
        "next_question": sanitize_question(next_q)
    }