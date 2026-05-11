import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
