import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import "./Home.css";

const ACTIVE_STATUSES = ["open", "in_progress"];

const Home = () => {
  const [userInfo] = useOutletContext();
  const [stats, setStats] = useState({ total: 0, mine: 0, created: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const [allResponse, mineResponse] = await Promise.all([
          api.get("/quests"),
          api.get("/quests/mine"),
        ]);
        if (!isMounted) return;

        const allQuests = allResponse.data.data || [];
        const myQuests = mineResponse.data.data || [];

        setStats({
          total: allQuests.filter((quest) => ACTIVE_STATUSES.includes(quest.status)).length,
          mine: myQuests.length,
          created: myQuests.filter(
            (quest) => String(quest.creator?._id || quest.creator) === String(userInfo._id)
          ).length,
        });
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (userInfo && userInfo._id) loadStats();

    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  const value = (count) => (isLoading ? "..." : count);

  return (
    <div className="dashboard">
      <h2>Welcome back, {userInfo.username}!</h2>
      {error && <p className="dashboard-error">{error}</p>}
      <div className="dashboard-content">
        <div className="dashboard-item">
          <h1>Open quests</h1>
          <h2>{value(stats.total)}</h2>
        </div>
        <div className="dashboard-item">
          <h1>My quests</h1>
          <h2>{value(stats.mine)}</h2>
        </div>
        <div className="dashboard-item">
          <h1>Quests I created</h1>
          <h2>{value(stats.created)}</h2>
        </div>
      </div>
      <div className="dashboard-links">
        <Link to="/browse_quests">Browse open quests</Link>
        <Link to="/my_quests">View my quests</Link>
      </div>
    </div>
  );
};

export default Home;