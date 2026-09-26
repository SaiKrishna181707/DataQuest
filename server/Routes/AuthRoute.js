const router = require("express").Router();

const { Signup, Login, Logout } = require("../Controllers/AuthController");
const { verifySession } = require("../Middlewares/AuthMiddleware");

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/verify", verifySession);

module.exports = router;