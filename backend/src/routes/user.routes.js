const express = require("express");
const router = express.Router();

const signup = require("../controllers/signup");
const login = require("../controllers/login");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/signup", signup);

router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome to your profile",
    user: req.user,
  });
});

module.exports = router;