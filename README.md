# SmartPrep AI (ProCoders Test)

drive link :https://drive.google.com/drive/folders/1qPFRz5JUWTOl7BkBMNLnjAcRDrKQe2OL?usp=sharing

Adaptive placement-prep platform with a FastAPI backend and React frontend.
It delivers subject-wise quizzes, easy-to-hard progression, weak-area targeting, and personalized chapter re-read recommendations.

## 1. Project Snapshot

SmartPrep AI helps learners prepare for placements by:

- Starting with easier questions, then adapting difficulty based on performance.
- Tracking concept mastery, accuracy, and speed in real time.
- Identifying weak areas automatically.
- Recommending specific chapters/resources to re-read.
- Presenting everything in a modern, animated UI dashboard.

## 2. Core Features

- Adaptive question selection (easy -> medium -> hard with performance signals).
- No repeated questions within an active quiz session.
- Subject browser with live quiz launch.
- Dashboard analytics: readiness, accuracy, speed, concept mastery, history.
- Chapter recommendation engine mapped to weak concepts.
- OpenTDB integration with resilient fallback (cache, then offline-generated items).
- MongoDB persistence with automatic in-memory fallback if DB is unavailable.
- Auth endpoints available (`/auth/signup`, `/auth/login`) for extension.
- Frontend landing page with scroll/reveal/parallax effects and tab navigation.

## 3. Supported Subjects

- Computer Science
- Mathematics
- Science & Nature
- General Knowledge
- History
- Geography

## 4. Tech Stack

- Frontend: React 19, Vite, CSS, Recharts.
- Backend: FastAPI, Pydantic, Requests.
- Data store: MongoDB via PyMongo (optional but preferred).
- Testing: Pytest (selector logic), ESLint, Vite production build.

## 5. Project Structure

```text
procoders test/
  Backend/
    main.py
    questions.py
    selector.py
    tracker.py
    database.py
    requirements.txt
    tests/
      test_selector.py
  frontend/
    src/
      App.jsx
      quiz.jsx
      api.js
      App.css
      index.css
    package.json
```

## 6. Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+
- MongoDB (local or Atlas) optional

### Backend Setup

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 7. Environment Variables

Backend reads these environment variables:

- `MONGO_URI` (default: `mongodb://localhost:27017`)
- `MONGO_DB_NAME` (default: `adaptive_learning`)

If MongoDB is unreachable, the app automatically runs in-memory mode.

## 8. API Reference

### Health

- `GET /`

Response includes backend status and persistence mode.

### Subjects

- `GET /subjects`

Returns all available quiz subjects.

### Auth

- `POST /auth/signup`
- `POST /auth/login`

### Quiz Start

- `POST /start`

Request body:

```json
{
  "user_id": "guest_user",
  "subject_id": "computer_science",
  "amount": 12
}
```

Returns first sanitized question, total count, active analytics snapshot, and subject info.

### Quiz Answer

- `POST /answer`

Request body:

```json
{
  "user_id": "guest_user",
  "question_id": 3,
  "selected": "Option text",
  "time_taken": 6.7
}
```

Returns correctness, next sanitized question (if any), completion flag, analytics, and optional explanation.

### Dashboard

- `GET /dashboard/{user_id}`

Returns:

- Performance summary.
- Concept mastery map.
- Weak/strong areas.
- Progress history.
- Study plan.
- Chapter recommendations + revision message.

## 9. Adaptive Logic (How It Works)

### Difficulty Flow

- Starts from easy when possible.
- Targets difficulty by quiz progress stage (early/mid/late).
- Adjusts up/down by readiness score and recent outcomes.

### Weak-Area Prioritization

- Selector first tries matching target difficulty + weak concept.
- Then target difficulty only.
- Then weak concept only.
- Then closest-difficulty fallback.

### Readiness Formula

Readiness is derived as:

`readiness = (accuracy * 0.7) + (speed_score * 30)`

Where speed score is a banded multiplier from average response time.

## 10. Product Requirements (PRD/PDR)

### Problem Statement

Placement aspirants often practice without clear prioritization, leading to slow improvement and weak topic visibility.

### Product Vision

Provide an adaptive learning assistant that turns quiz attempts into focused, actionable next steps.

### Target Users

- College students preparing for placements.
- Self-learners revising aptitude/CS fundamentals.
- Mentors who need quick readiness signals.

### Goals

- Improve readiness score through adaptive sequencing.
- Reduce weak-topic blind spots with concept-level analytics.
- Recommend concrete revision resources after each cycle.

### Non-Goals (Current Scope)

- Live proctored exams.
- Multi-tenant enterprise auth/roles.
- Full LMS content hosting.

### Functional Requirements

- Subject selection and adaptive quiz start.
- Question progression without repeats in session.
- Real-time analytics after each answer.
- Session completion summary.
- Dashboard with weak/strong/concept mastery breakdown.
- Chapter re-read recommendations tied to weak areas.

### Non-Functional Requirements

- Responsive UI for desktop/mobile.
- Graceful degradation when trivia API fails.
- Graceful degradation when MongoDB is unavailable.
- Fast local startup for development.

### Success Metrics

- Readiness score trend over sessions.
- Improvement in weak-area mastery.
- Reduction in average response time.
- Higher correct-attempt ratio across repeated practice.

## 11. Data & Persistence Notes

- User profiles store aggregate concept stats and session records.
- Active sessions store live attempts/timeline state.
- Session summaries are appended to user records.
- Persistence mode is reported in API responses (`mongodb` or `in-memory`).

## 12. Quality Checks

### Backend

```powershell
cd Backend
pytest -q
```

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

## 13. Security and Contract Notes

- Quiz responses are sanitized before sending to frontend.
- Correct answer text is not exposed in `/start` or `/answer` question payloads.
- Wrong answer feedback uses concept-focused explanations.
- Passwords are SHA-256 hashed in current implementation.

## 14. Troubleshooting

- If frontend cannot call backend, ensure backend is running on port `8000`.
- If `npm run dev` exits, run `npm install` again and retry.
- If MongoDB is down, app should still run in-memory; check root endpoint persistence field.
- If OpenTDB fails, backend falls back to cached or offline-generated questions.

## 15. Roadmap Ideas

- JWT/session token auth on frontend.
- Leaderboards and streak tracking.
- More granular chapter recommendations per session.
- Admin/mentor analytics view.
- Export progress reports.

---

Built as a full-stack adaptive quiz system for placement readiness.
