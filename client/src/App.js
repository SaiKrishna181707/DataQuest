import './App.css';
import { Outlet, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ToastContainer } from "react-toastify";
import {
  Main,
  Login,
  Signup,
  Home,
  MyQuests,
  BrowseQuests,
  QuestDetails,
  Profile,
  Settings,
  Achievements,
  Account,
} from './pages';
import api, { getErrorMessage } from "./api";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/my_quests" element={<MyQuests />} />
          <Route path="/browse_quests" element={<BrowseQuests />} />
          <Route path="/quest/:id" element={<QuestDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/account" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

/**
 * Authenticated shell. It asks the API to verify the JWT cookie before
 * rendering any protected page, so refreshing the page keeps the user signed in
 * and signed-out visitors are redirected to the login page.
 */
function Layout() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const { data } = await api.post("/verify");
        if (!isMounted) return;
        if (data.status) {
          setUserInfo(data.userinfo);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn(getErrorMessage(error));
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.warn(getErrorMessage(error));
    }
    setUserInfo(null);
    navigate("/login", { replace: true });
  };

  if (isCheckingSession) {
    return <div className="session-loading">Loading DataQuest...</div>;
  }

  if (!userInfo) return null;

  return (
    <div className="layout">
      <Navbar logout={handleLogout} />
      <div className="layout-content">
        <Sidebar />
        <main>
          <Outlet context={[userInfo, setUserInfo]} />
        </main>
      </div>
      <ToastContainer position="bottom-left" />
    </div>
  );
}

export default App;