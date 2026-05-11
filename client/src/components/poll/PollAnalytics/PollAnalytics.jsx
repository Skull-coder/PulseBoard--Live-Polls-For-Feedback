import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./PollAnalytics.css";

const PollAnalytics = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalResponses, setTotalResponses] = useState(0);
  const [analytics, setAnalytics] = useState({});
  const [isLive, setIsLive] = useState(false);

  // Fetch poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:3000/poll/${pollId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.data;
        setPoll(data);
        if (data.totalResponses !== undefined) {
          setTotalResponses(data.totalResponses);
        }
      } catch (err) {
        setError("Failed to load poll.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  // Socket.io for live analytics
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const socket = io("http://localhost:3000", {
      auth: { token: accessToken },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsLive(true);
      socket.emit("join-dashboard", { pollId });
    });

    socket.on("analytics-init", (data) => {
      setTotalResponses(data.totalResponses);
      setAnalytics(data.analytics);
    });

    socket.on("poll-updated", (data) => {
      setTotalResponses(data.totalResponses);
      setAnalytics(data.analytics);
    });

    socket.on("disconnect", () => {
      setIsLive(false);
    });

    socket.on("connect_error", () => {
      setIsLive(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [pollId]);

  const getVotesForOption = (questionId, optionId) => {
    const questionAnalytics = analytics[questionId];
    if (!questionAnalytics) return 0;
    return parseInt(questionAnalytics[optionId] || 0, 10);
  };

  const getTotalVotesForQuestion = (questionId) => {
    const questionAnalytics = analytics[questionId];
    if (!questionAnalytics) return 0;
    return Object.values(questionAnalytics).reduce(
      (sum, v) => sum + parseInt(v, 10),
      0
    );
  };

  const getPercent = (votes, total) => {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  };

  const isExpired = poll && new Date(poll.expiresAt) < new Date();

  const handlePublish = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `http://localhost:3000/poll/${pollId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setPoll((prev) => ({ ...prev, isPublished: true }));
    } catch (err) {
      console.log("Publish error:", err);
    }
  };

  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(pollUrl);
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <p className="loading-text">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="header-right">
          {isLive && !isExpired && (
            <span className="live-badge">
              <span className="live-dot" />
              Live
            </span>
          )}
          {isExpired && !poll.isPublished && (
            <button className="publish-btn" onClick={handlePublish}>
              Publish Results
            </button>
          )}
          {poll.isPublished && (
            <span className="published-tag">Results Published</span>
          )}
        </div>
      </div>

      <div className="analytics-meta">
        <div className="stat-card">
          <span className="stat-value">{totalResponses}</span>
          <span className="stat-label">Total Responses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {isExpired ? "Expired" : "Active"}
          </span>
          <span className="stat-label">Status</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{poll.responseMode || "—"}</span>
          <span className="stat-label">Mode</span>
        </div>
      </div>

      {/* Share link */}
      
        <div className="share-section">
          <span className="share-label">Share link:</span>
          <span className="share-url">{pollUrl}</span>
          <button className="copy-btn" onClick={copyLink}>
            Copy
          </button>
        </div>
      

      {/* Questions & options */}
      <div className="questions-analytics">
        {poll.questions?.map((question) => {
          const totalVotes = getTotalVotesForQuestion(question._id);
          return (
            <div className="question-analytics-card" key={question._id}>
              <p className="question-text">{question.question}</p>
              <div className="options-analytics">
                {question.options.map((option) => {
                  const votes = getVotesForOption(question._id, option._id);
                  const percent = getPercent(votes, totalVotes);
                  return (
                    <div className="option-analytics-row" key={option._id}>
                      <div className="option-info">
                        <span className="option-text">{option.text}</span>
                        <span className="option-votes">
                          {votes} vote{votes !== 1 ? "s" : ""} · {percent}%
                        </span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollAnalytics;