/**
 * Shapes a user document for API responses.
 * The password hash must never leave the server.
 */
const toPublicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  bio: user.bio,
  image: user.image,
  createdAt: user.createdAt,
});

module.exports = { toPublicUser };