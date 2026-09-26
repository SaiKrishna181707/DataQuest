require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoute = require("./Routes/AuthRoute");
const questRoute = require("./Routes/QuestRoute");

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_DB_NAME = "dataquest";

// Render terminates TLS in front of the app, so trust its proxy headers to let
// `secure` cookies behave correctly in production.
app.set("trust proxy", 1);

// CORS_ORIGIN accepts a comma-separated whitelist, e.g.
// "http://localhost:3000,https://dataquest.vercel.app"
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin requests, curl, or platform health checks.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Never leak connection strings, secrets or credentials into logs.
const redactSecrets = (value) =>
  String(value)
    .replace(/mongodb(\+srv)?:\/\/[^\s"']+/gi, "mongodb://<redacted>")
    .replace(/(JWT_SECRET|TOKEN_KEY)\s*[=:]\s*\S+/gi, "$1=<redacted>");

app.get("/health", (req, res) => {
  res.json({ success: true, message: "DataQuest API is running" });
});

app.use("/", authRoute);
app.use("/", questRoute);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  const message = error && error.message ? error.message : String(error);

  if (message.includes("not allowed by CORS")) {
    console.warn(`Blocked request from a disallowed origin: ${req.headers.origin}`);
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }

  // body-parser marks client-side problems (malformed JSON, payload too large)
  // with a 4xx status. Those are bad requests, not server failures.
  const clientStatus = Number(error && (error.status || error.statusCode));
  if (clientStatus >= 400 && clientStatus < 500) {
    return res
      .status(clientStatus)
      .json({ success: false, message: "Invalid request body" });
  }

  console.error("Unhandled server error:", redactSecrets(message));
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const assertConfiguration = () => {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(
        ", "
      )}. Copy server/.env.example to server/.env and fill in your own values.`
    );
  }
};

const connectToDatabase = async () => {
  assertConfiguration();
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || DEFAULT_DB_NAME,
    serverSelectionTimeoutMS: 10000,
  });
};

const startServer = async () => {
  try {
    await connectToDatabase();
    const dbName = process.env.MONGODB_DB || DEFAULT_DB_NAME;
    console.log(`Connected to MongoDB (database: ${dbName})`);

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", redactSecrets(error.message));
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Disconnected from MongoDB");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
      console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error(`Failed to start the DataQuest API: ${redactSecrets(error.message)}`);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down.`);
  mongoose.connection.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();