import axios from "axios";

const FALLBACK_SERVER_URL = "http://localhost:5000";

const configuredServerUrl = process.env.REACT_APP_SERVER_URL;

if (!configuredServerUrl) {
  // Local development reads client/.env. Production (Vercel) must define
  // REACT_APP_SERVER_URL in the project's environment variables.
  console.warn(
    "REACT_APP_SERVER_URL is not set - falling back to " +
      FALLBACK_SERVER_URL +
      ". Set it in client/.env locally and in your Vercel project settings for production."
  );
}

export const SERVER_URL = (configuredServerUrl || FALLBACK_SERVER_URL).replace(/\/+$/, "");

// withCredentials makes the browser send and store the auth cookie.
const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

/** Turns any axios failure into a message that is safe to show the user. */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error && error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error && error.request) {
    return "Cannot reach the DataQuest server. Please check your connection and try again.";
  }
  return fallback;
};

export default api;