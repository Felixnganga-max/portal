const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const auth = require("../controllers/authController");

router.post("/login", auth.login);
router.post("/users", protect, restrictTo("admin"), auth.createUser);

module.exports = router;
