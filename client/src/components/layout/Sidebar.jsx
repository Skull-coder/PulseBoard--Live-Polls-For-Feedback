import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      await axios.post(
        "http://localhost:3000/auth/logout",
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◈</span>
        <span className="brand-name">PulseBoard</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user.username?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user.username}</p>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="nav-icon">▦</span>
          My Polls
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="nav-icon">＋</span>
          Create Poll
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="nav-icon">→</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;