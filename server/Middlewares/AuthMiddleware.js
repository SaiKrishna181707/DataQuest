const User = require("../Models/UserModel");
const { verifySecretToken } = require("../util/SecretToken");
const { TOKEN_COOKIE_NAME } = require("../util/cookieOptions");
const { toPublicUser } = require("../util/publicUser");

// Returns the signed-in user id, or null when the request has no usable token.
const readUserIdFromCookie = (req) => {
  const token = req.cookies ? req.cookies[TOKEN_COOKIE_NAME] : null;
  if (!token) return null;
  try {
    const payload = verifySecretToken(token);
    return payload && payload.id ? payload.id : null;
  } catch (error) {
    // A missing, malformed or expired token all mean "not signed in".
    return null;
  }
};

/** Route guard: rejects the request with 401 unless the auth cookie is valid. */
const verifyToken = (req, res, next) => {
  const userId = readUserIdFromCookie(req);
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "You must be logged in to do that" });
  }
  req.userId = userId;
  return next();
};

/** POST /verify - lets the SPA restore its session after a page refresh. */
const verifySession = async (req, res, next) => {
  try {
    const userId = readUserIdFromCookie(req);
    if (!userId) return res.json({ status: false });

    const user = await User.findById(userId);
    if (!user) return res.json({ status: false });

    return res.json({ status: true, userinfo: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { verifyToken, verifySession };