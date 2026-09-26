import React from "react";
import { Link } from "react-router-dom";

const Main = () => {
  return (
    <div className="container">
      <div className="header">
        <Link to="/login" className="auth-btn">Login</Link>
        <Link to="/signup" className="auth-btn">Sign Up</Link>
      </div>
      <div className="image-container"></div>
      <div className="form-container">
        <div className="content">
          <h1>Welcome to DataQuest</h1>
          <p>Where researchers post data-collection quests and contributors make them happen.</p>
          <div className="additional-content">
            <h1>How DataQuest Works</h1>
            <p>Researchers publish a quest describing the data they need, where to collect it and why it matters.</p>
            <p>Contributors browse open quests, join the ones that match their interests and submit their observations.</p>
            <p>Every contribution feeds real research, and your profile keeps track of the quests you have joined.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;