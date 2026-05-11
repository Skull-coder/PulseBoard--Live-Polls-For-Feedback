import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/login/Login.jsx";
import Signup from "./components/auth/signup/Signup.jsx";
import VerifyEmail from "./components/auth/verifyEmail/VerifyEmail.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx"
import MyPolls from "./components/poll/MyPolls/MyPolls.jsx";
import CreatePoll from "./components/poll/CreatePoll/CreatePoll.jsx";
import PollAnalytics from "./components/poll/PollAnalytics/PollAnalytics.jsx";
import PollVote from "./components/poll/PollVote/PollVote.jsx";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/register" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Public poll voting */}
      <Route path="/poll/:pollId" element={<PollVote />} />

      {/* Dashboard (nested) */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<MyPolls />} />
        <Route path="create" element={<CreatePoll />} />
        <Route path="polls/:pollId" element={<PollAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;