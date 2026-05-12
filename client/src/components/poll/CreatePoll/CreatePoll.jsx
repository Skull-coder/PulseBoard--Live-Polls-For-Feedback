import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api.js";
import "./CreatePoll.css";

const EMPTY_QUESTION = {
  question: "",
  required: true,
  options: ["", ""],
};

const CreatePoll = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION, options: ["", ""] }]);
  const [responseMode, setResponseMode] = useState("ANONYMOUS");
  const [expiryDuration, setExpiryDuration] = useState("5_MIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // --- Question handlers ---

  const updateQuestion = (qIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, question: value } : q))
    );
  };

  const updateRequired = (qIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, required: value } : q))
    );
  };

  const addQuestion = () => {
    if (questions.length >= 5) return;
    setQuestions((prev) => [...prev, { question: "", required: true, options: ["", ""] }]);
  };

  const removeQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx));
  };

  // --- Option handlers ---

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) }
          : q
      )
    );
  };

  const addOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx && q.options.length < 4
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx && q.options.length > 2
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx) }
          : q
      )
    );
  };

  // --- Submit ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!title.trim()) {
      setError("Poll title cannot be empty.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setError(`Question ${i + 1} cannot be empty.`);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          setError(`Question ${i + 1}, Option ${j + 1} cannot be empty.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          required: q.required,
          options: q.options.map((o) => o.trim()),
        })),
        responseMode,
        expiryDuration,
      };

      await api.post("/poll/create", payload);

      navigate("/");
    } catch (err) {
      const message = err.response?.data?.error?.message || "Failed to create poll.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createpoll-container">
      <div className="createpoll-header">
        <h1 className="createpoll-title">Create a Poll</h1>
      </div>

      <form className="createpoll-form" onSubmit={handleSubmit}>
        
        {/* Title Section */}
        <div className="title-section">
          <input
            className="poll-title-input"
            type="text"
            placeholder="Enter Poll Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Questions */}
        <div className="questions-section">
          {questions.map((q, qIdx) => (
            <div className="question-card" key={qIdx}>
              <div className="question-card-header">
                <span className="question-label">Question {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeQuestion(qIdx)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                className="poll-input"
                type="text"
                placeholder="Enter your question"
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, e.target.value)}
              />

              <div className="options-list">
                {q.options.map((option, oIdx) => (
                  <div className="option-row" key={oIdx}>
                    <span className="option-bullet">{oIdx + 1}.</span>
                    <input
                      className="poll-input option-input"
                      type="text"
                      placeholder={`Option ${oIdx + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        className="remove-option-btn"
                        onClick={() => removeOption(qIdx, oIdx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {q.options.length < 4 && (
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={() => addOption(qIdx)}
                >
                  + Add Option
                </button>
              )}

              <label className="required-toggle">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateRequired(qIdx, e.target.checked)}
                />
                Required question
              </label>
            </div>
          ))}

          {questions.length < 5 && (
            <button type="button" className="add-question-btn" onClick={addQuestion}>
              + Add Question
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="settings-section">
          <div className="setting-group">
            <label className="setting-label">Response Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="responseMode"
                  value="ANONYMOUS"
                  checked={responseMode === "ANONYMOUS"}
                  onChange={() => setResponseMode("ANONYMOUS")}
                />
                Anonymous
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="responseMode"
                  value="AUTHENTICATED"
                  checked={responseMode === "AUTHENTICATED"}
                  onChange={() => setResponseMode("AUTHENTICATED")}
                />
                Authenticated
              </label>
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">Expiry Duration</label>
            <select
              className="poll-select"
              value={expiryDuration}
              onChange={(e) => setExpiryDuration(e.target.value)}
            >
              <option value="5_MIN">5 Minutes</option>
              <option value="10_MIN">10 Minutes</option>
              <option value="15_MIN">15 Minutes</option>
            </select>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;