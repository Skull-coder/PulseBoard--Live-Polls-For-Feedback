import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/login/Login";
import Signup from "./components/auth/signup/Signup";
import VerifyEmail from "./components/auth/verifyEmail/VerifyEmail";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
