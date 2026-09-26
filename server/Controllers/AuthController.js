const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const {
  TOKEN_COOKIE_NAME,
  tokenCookieOptions,
  clearTokenCookieOptions,
} = require("../util/cookieOptions");
const { toPublicUser } = require("../util/publicUser");

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const firstValidationMessage = (error) => Object.values(error.errors)[0].message;

module.exports.Signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (!trimmedUsername || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are all required",
      });
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email address" });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      username: trimmedUsername,
      email: normalizedEmail,
      password,
    });

    const token = createSecretToken(user._id);
    res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    // Unique index race: two signups with the same email at the same time.
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    if (error && error.name === "ValidationError") {
      return res
        .status(400)
        .json({ success: false, message: firstValidationMessage(error) });
    }
    return next(error);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const passwordMatches = await user.comparePassword(String(password));
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const token = createSecretToken(user._id);
    res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.Logout = (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, clearTokenCookieOptions());
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};