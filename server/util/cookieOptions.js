const TOKEN_COOKIE_NAME = "token";
const TOKEN_TTL_SECONDS = 3 * 24 * 60 * 60; // 3 days
const TOKEN_MAX_AGE_MS = TOKEN_TTL_SECONDS * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

// The DataQuest frontend (Vercel) and API (Render) live on different domains in
// production, so the auth cookie has to be sent cross-site: SameSite=None with
// Secure. Locally both run on localhost over plain HTTP, where Secure cookies
// would be dropped, so development uses SameSite=Lax without Secure.
const baseCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
});

const tokenCookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: TOKEN_MAX_AGE_MS,
});

// clearCookie only needs to match name/path/sameSite/secure/httpOnly.
const clearTokenCookieOptions = () => baseCookieOptions();

module.exports = {
  TOKEN_COOKIE_NAME,
  TOKEN_TTL_SECONDS,
  TOKEN_MAX_AGE_MS,
  isProduction,
  tokenCookieOptions,
  clearTokenCookieOptions,
};