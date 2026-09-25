const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true }, // used for M-Pesa STK + SMS alerts
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true, // multi-tenant: every user belongs to one college
    },
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
    },

    // Student-only fields
    admissionNumber: { type: String, sparse: true, unique: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    currentSemester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    intakeYear: Number,

    // Instructor-only fields
    staffNumber: { type: String, sparse: true },
    department: String,

    lastLogin: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
