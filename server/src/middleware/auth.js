const jwt = require("jsonwebtoken");
const User = require("../models//user");
const Institution = require("../models/institution");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Account inactive or not found" });
    }

    const institution = await Institution.findById(user.institution);
    if (!institution) {
      return res.status(401).json({ message: "Institution not found" });
    }

    req.user = user;
    req.institution = institution;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// usage: restrictTo('admin', 'instructor')
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }
    next();
  };

module.exports = { protect, restrictTo };
