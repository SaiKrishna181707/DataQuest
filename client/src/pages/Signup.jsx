import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import api, { getErrorMessage } from "../api";

const MIN_PASSWORD_LENGTH = 8;

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username, email, password, confirmPassword } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue((current) => ({ ...current, [name]: value }));
  };

  const showError = (message) => toast.error(message, { position: "bottom-left" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!username.trim() || !email.trim() || !password) {
      showError("Username, email and password are all required");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      showError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      // confirmPassword is only used for the client-side check above.
      const { data } = await api.post("/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      toast.success(data.message, { position: "bottom-left" });
      setTimeout(() => navigate("/home", { replace: true }), 600);
    } catch (error) {
      showError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="image-container"></div>
      <div className="form-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Enter your username"
              onChange={handleOnChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              onChange={handleOnChange}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              placeholder="Re-enter your password"
              onChange={handleOnChange}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
          <span>
            Already have an account? <Link to={"/login"}>Login</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;