import { useCallback, useEffect, useMemo, useState } from "react";
import { startQuiz, submitAnswer } from "./api";

const FEEDBACK_DELAY_MS = 700;
const FOCUS_DURATION_SECONDS = 15 * 60;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function Quiz({ user, subject, onExit, onComplete }) {
  const [question, setQuestion] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(FOCUS_DURATION_SECONDS);
  const [error, setError] = useState("");

  const answeredCount = analytics?.attempts ?? 0;
  const questionNumber = Math.min(answeredCount + 1, Math.max(totalQuestions, 1));
  const progressPercent = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }
    return Math.min(((analytics?.progress_ratio ?? 0) * 100) + (100 / totalQuestions), 100);
  }, [analytics?.progress_ratio, totalQuestions]);

  const loadFirstQuestion = useCallback(async () => {
    try {
      setError("");
      setQuestion(null);
      setIsCompleted(false);
      setSessionSummary(null);
      setExplanation("");
      setIsLoading(true);
      const data = await startQuiz({
        user_id: user.id,
        subject_id: subject.id,
        amount: 12,
      });

      setQuestion(data.question);
      setTotalQuestions(data.total_questions || 0);
      setAnalytics(data.analytics || null);
      setStartTime(Date.now());
      setFocusSeconds(FOCUS_DURATION_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load first question.");
    } finally {
      setIsLoading(false);
    }
  }, [subject?.id, user?.id]);

  useEffect(() => {
    if (user?.id && subject?.id) {
      void loadFirstQuestion();
    }
  }, [loadFirstQuestion, subject?.id, user?.id]);

  useEffect(() => {
    if (!isFocusMode || isCompleted || isLoading || !question) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setFocusSeconds((current) => {
        if (current <= 1) {
          setIsFocusMode(false);
          setError("Focus mode timer completed. Take a short break and continue.");
          return FOCUS_DURATION_SECONDS;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isFocusMode, isCompleted, isLoading, question]);

  const handleAnswer = async (option) => {
    if (!question || isSubmitting) {
      return;
    }

    const timeTaken = (Date.now() - startTime) / 1000;

    try {
      setError("");
      setIsSubmitting(true);
      setExplanation("");

      const data = await submitAnswer({
        user_id: user.id,
        question_id: question.id,
        selected: option,
        time_taken: timeTaken,
      });

      setFeedback(data.correct ? "Correct answer" : "Wrong answer");
      if (!data.correct && data.explanation) {
        setExplanation(data.explanation);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, FEEDBACK_DELAY_MS);
      });

      setAnalytics(data.analytics || null);

      if (data.next_question) {
        setQuestion(data.next_question);
        setStartTime(Date.now());
      } else if (data.completed) {
        setQuestion(null);
        setIsCompleted(true);
        setSessionSummary(data.session_summary || null);
        if (typeof onComplete === "function") {
          onComplete(data.session_summary || null);
        }
      } else {
        setError("No next question was returned by the server.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit answer.");
    } finally {
      setFeedback(null);
      setIsSubmitting(false);
    }
  };

  if (isLoading && !question) {
    return (
      <section className="quiz-card loading-card" aria-live="polite">
        <h2>Loading your next challenge...</h2>
      </section>
    );
  }

  if (isCompleted) {
    return (
      <section className="quiz-card" aria-live="polite">
        <h2>Quiz complete</h2>
        <p className="subheading">Great job. You completed the adaptive learning loop.</p>

        {sessionSummary ? (
          <div className="summary-grid">
            <article className="metric-tile">
              <h3>Accuracy</h3>
              <p>{sessionSummary.accuracy}%</p>
            </article>
            <article className="metric-tile">
              <h3>Readiness</h3>
              <p>{sessionSummary.readiness_score}%</p>
            </article>
            <article className="metric-tile">
              <h3>Avg Speed</h3>
              <p>{sessionSummary.avg_time}s</p>
            </article>
          </div>
        ) : null}

        <div className="quiz-actions">
          <button className="action-btn" onClick={loadFirstQuestion}>
            Retry this subject
          </button>
          <button className="ghost-btn" onClick={onExit}>
            Back to subjects
          </button>
        </div>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="quiz-card" aria-live="polite">
        <h2>Question unavailable</h2>
        {error ? <p className="error-banner">{error}</p> : null}
        <button className="action-btn" onClick={loadFirstQuestion}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={`quiz-card quiz-surface ${isFocusMode ? "focus-mode" : ""}`}>
      <div className="quiz-toolbar">
        <div>
          <p className="kicker">{subject.name}</p>
          <p className="progress-label">
            Question {questionNumber} of {totalQuestions || "-"}
          </p>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className={`focus-toggle ${isFocusMode ? "active" : ""}`}
            onClick={() => setIsFocusMode((current) => !current)}
          >
            Focus Mode {isFocusMode ? `ON (${formatTime(focusSeconds)})` : "OFF"}
          </button>
          <button type="button" className="ghost-btn" onClick={onExit}>
            Exit Quiz
          </button>
        </div>
      </div>

      <div className="progress-track" role="progressbar" aria-valuenow={progressPercent}>
        <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="quiz-meta">
        <span className="pill">{question.topic || question.concept}</span>
        {question.topic && question.topic !== question.concept ? (
          <span className="pill muted">{question.concept}</span>
        ) : null}
        <span className="pill muted">{question.difficulty}</span>
      </div>

      {analytics ? (
        <div className="live-analytics">
          <article className="mini-metric">
            <h4>Readiness</h4>
            <p>{analytics.readiness_score}%</p>
          </article>
          <article className="mini-metric">
            <h4>Accuracy</h4>
            <p>{analytics.accuracy}%</p>
          </article>
          <article className="mini-metric">
            <h4>Speed</h4>
            <p>{analytics.avg_time}s</p>
          </article>
        </div>
      ) : null}

      <h2 className="quiz-question">{question.question}</h2>

      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={`${question.id}-${option}`}
            className="option-btn"
            disabled={isSubmitting}
            onClick={() => handleAnswer(option)}
          >
            <span className="option-index">{index + 1}.</span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.startsWith("Correct") ? "correct" : "wrong"}`}>
          {feedback}
        </p>
      ) : null}

      {explanation ? <p className="explanation-text">{explanation}</p> : null}

      {analytics?.weak_areas?.length ? (
        <div className="weakness-row">
          <p>Weak areas:</p>
          {analytics.weak_areas.map((area) => (
            <span key={area} className="weak-chip">
              {area}
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}

export default Quiz;