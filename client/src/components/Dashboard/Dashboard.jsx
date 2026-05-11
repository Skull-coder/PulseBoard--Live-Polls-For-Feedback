import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
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