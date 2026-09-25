const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Institution = require("../models/institution");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

exports.login = async (req, res) => {
  try {
    const { email, password, institutionSlug } = req.body;

    const institution = await Institution.findOne({ slug: institutionSlug });
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      institution: institution._id,
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        institution: institution.slug,
        program: user.program,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin-only: create instructor/student accounts (registrar-issued, no public signup for now)
exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      admissionNumber,
      program,
      staffNumber,
      department,
    } = req.body;

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      institution: req.institution._id,
      admissionNumber,
      program,
      staffNumber,
      department,
    });

    res
      .status(201)
      .json({ id: user._id, fullName: user.fullName, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
