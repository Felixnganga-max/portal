const mongoose = require("mongoose");

const unitRegistrationSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned lecturer for this unit+semester

    status: {
      type: String,
      enum: ["registered", "dropped", "completed"],
      default: "registered",
    },
    registeredBy: {
      type: String,
      enum: ["self", "admin"],
      default: "self",
    },

    // rolled-up results (kept in sync by the grading engine, not the source of truth)
    catScore: Number, // percentage
    examScore: Number, // percentage
    finalScore: Number,
    grade: String,

    attendancePercent: { type: Number, default: 100 },
  },
  { timestamps: true },
);

unitRegistrationSchema.index(
  { student: 1, unit: 1, semester: 1 },
  { unique: true },
);

module.exports = mongoose.model("UnitRegistration", unitRegistrationSchema);
