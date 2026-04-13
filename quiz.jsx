import React, { useState, useEffect } from "react";

const BaseUrl = "http://localhost:8000";

function Quiz() {
  const [question, setQuestion] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

 
  useEffect(() => {
    loadFirstQuestion();
  }, []);

  const loadFirstQuestion = async () => {
    const res = await fetch(`${BaseUrl}/start`);
    const data = await res.json();

    setQuestion(data);
    setStartTime(Date.now());
    setLoading(false);
  };

  
  const handleAnswer = async (option) => {
    if (!question) return;

    const timeTaken = (Date.now() - startTime) / 1000;

    setLoading(true);

    const res = await fetch(`${BaseUrl}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question_id: question.id,
        selected: option,
        time_taken: timeTaken
      })
    });

    const data = await res.json();

    setFeedback(data.correct ? "Correct ✅" : "Wrong ❌");

    setTimeout(() => {
      setFeedback(null);
      setQuestion(data.next_question);
      setStartTime(Date.now());
      setLoading(false);
    }, 800);
  };

  if (!question) return <h2>Loading...</h2>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{question.question}</h2>

      {question.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(opt)}
          style={{
            margin: "10px auto",
            padding: "10px 20px",
            display: "block",
            width: "250px",
            cursor: "pointer"
          }}
        >
          {opt}
        </button>
      ))}

      {feedback && <h3>{feedback}</h3>}
    </div>
  );
}

export default Quiz;