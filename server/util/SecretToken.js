const jwt = require("jsonwebtoken");

const { TOKEN_TTL_SECONDS } = require("./cookieOptions");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured. Add it to server/.env locally and to the Render environment variables in production."
    );
  }
  return secret;
};

const createSecretToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: TOKEN_TTL_SECONDS });

const verifySecretToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = { createSecretToken, verifySecretToken };