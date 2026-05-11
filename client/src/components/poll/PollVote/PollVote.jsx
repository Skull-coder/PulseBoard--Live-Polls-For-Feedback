import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import "./PollVote.css";

const PollVote = () => {
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/poll/${pollId}`);
        setPoll(response.data.data);
      } catch (err) {
        const message =
          err.response?.data?.error?.message || "Failed to load poll.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitError("");

    // Build answers array
    const answersArray = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })
    );

    // Check required questions
    if (poll.questions) {
      for (const q of poll.questions) {
        if (q.required && !answers[q._id]) {
          setSubmitError(`"${q.question}" is required.`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const payload = { answers: answersArray };
      const headers = {};

      if (poll.responseMode === "AUTHENTICATED") {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setSubmitError("You must be logged in to vote on this poll.");
          setIsSubmitting(false);
          return;
        }
        headers.Authorization = `Bearer ${accessToken}`;
      } else {
        // Anonymous: get fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        payload.fingerprint = result.visitorId;
      }

      await axios.post(
        `http://localhost:3000/response/${pollId}/submit`,
        payload,
        { headers }
      );

      setSubmitted(true);
    } catch (err) {
      const message =
        err.response?.data?.error?.message || "Failed to submit response.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="vote-wrapper">
        <div className="vote-container">
          <p className="loading-text">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vote-wrapper">
        <div className="vote-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (poll.isExpired && !poll.isPublished) {
    return (
      <div className="vote-wrapper">
        <div className="vote-container">
          <div className="expired-state">
            <p className="expired-title">Poll Ended</p>
            <p className="expired-sub">Results have not been published yet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (poll.isExpired && poll.isPublished) {
    return (
      <div className="vote-wrapper">
        <div className="vote-container">
          <p className="results-heading">Poll Results</p>
          <div className="results-meta">
            <span>{poll.totalResponses} total responses</span>
          </div>
          {poll.results?.map((q) => {
            const totalVotes = q.options.reduce((s, o) => s + o.votes, 0);
            return (
              <div className="result-card" key={q.questionId}>
                <p className="result-question">{q.question}</p>
                {q.options.map((option) => {
                  const percent = totalVotes
                    ? Math.round((option.votes / totalVotes) * 100)
                    : 0;
                  return (
                    <div className="result-option" key={option.optionId}>
                      <div className="result-option-info">
                        <span className="result-option-text">{option.text}</span>
                        <span className="result-option-votes">
                          {option.votes} vote · {percent}%
                        </span>
                      </div>
                      <div className="result-bar-track">
                        <div
                          className="result-bar-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="vote-wrapper">
        <div className="vote-container">
          <div className="success-state">
            <p className="success-title">Response Submitted!</p>
            <p className="success-sub">Thank you for participating.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-wrapper">
      <div className="vote-container">
        <p className="vote-brand">PulseBoard</p>
        <div className="vote-meta">
          <span className="vote-mode-badge">{poll.responseMode}</span>
          {poll.expiresAt && (
            <span className="vote-expires">
              Closes: {new Date(poll.expiresAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="vote-questions">
          {poll.questions?.map((question, idx) => (
            <div className="vote-question-card" key={question._id}>
              <p className="vote-question-text">
                {idx + 1}. {question.question}
                {question.required && (
                  <span className="required-asterisk"> *</span>
                )}
              </p>
              <div className="vote-options">
                {question.options.map((option) => (
                  <label
                    key={option._id}
                    className={`vote-option ${
                      answers[question._id] === option._id ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={question._id}
                      value={option._id}
                      checked={answers[question._id] === option._id}
                      onChange={() => handleSelect(question._id, option._id)}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {submitError && <p className="error-message">{submitError}</p>}

        <button
          className="vote-submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </button>
      </div>
    </div>
  );
};

export default PollVote;