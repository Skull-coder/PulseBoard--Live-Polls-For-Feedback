import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPolls.css";

const MyPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:3000/poll/myPolls", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPolls(response.data.data);
      } catch (err) {
        setError("Failed to load polls.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handlePublish = async (pollId, e) => {
    e.stopPropagation();
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `http://localhost:3000/poll/${pollId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setPolls((prev) =>
        prev.map((p) => (p._id === pollId ? { ...p, isPublished: true } : p))
      );
    } catch (err) {
      console.log("Publish error:", err);
    }
  };

  const deletePoll = async (pollId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:3000/poll/${pollId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const getPollStatus = (poll) => {
    const now = new Date();
    const expiresAt = new Date(poll.expiresAt);
    if (expiresAt < now) return "expired";
    return "active";
  };

  if (loading) {
    return (
      <div className="mypolls-container">
        <p className="loading-text">Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="mypolls-container">
      <div className="mypolls-header">
        <h1 className="mypolls-title">My Polls</h1>
        <button
          className="create-button"
          onClick={() => navigate("/create")}
        >
          + Create Poll
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {polls.length === 0 && !error ? (
        <div className="empty-state">
          <p className="empty-text">No polls yet.</p>
          <button
            className="create-button"
            onClick={() => navigate("/create")}
          >
            Create your first poll
          </button>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            return (
              <div
                key={poll._id}
                className="poll-card"
                onClick={() => navigate(`/polls/${poll._id}`)}
              >
                <div className="poll-card-header">
                  <span className={`status-badge status-${status}`}>
                    {status}
                  </span>
                  <span className="response-count">
                    {poll.totalResponses} response
                    {poll.totalResponses !== 1 ? "s" : ""}
                  </span>
                </div>

                <p className="poll-question">
                  {poll.questions[0]?.question || "Untitled Poll"}
                </p>

                <div className="poll-meta">
                  <span className="poll-mode">{poll.responseMode}</span>
                  <span className="poll-questions">
                    {poll.questions.length} question
                    {poll.questions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="poll-expires">
                  Expires: {new Date(poll.expiresAt).toLocaleString()}
                </div>

                <div className="poll-card-actions">
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePoll(poll._id);
                    }}
                  >
                    Delete
                  </button>
                  
                  {!poll.isPublished && status === "expired" && (
                    <button
                      className="publish-button"
                      onClick={(e) => handlePublish(poll._id, e)}
                    >
                      Publish Results
                    </button>
                  )}
                  {poll.isPublished && (
                    <span className="published-badge">Results Published</span>
                  )}
                  <button
                    className="analytics-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/polls/${poll._id}`);
                    }}
                  >
                    View Analytics →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPolls;