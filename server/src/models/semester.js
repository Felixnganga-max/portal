const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    name: { type: String, required: true }, // e.g. "2026 September Intake - Semester 1"
    academicYear: { type: String, required: true }, // e.g. "2026/2027"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    registrationWindow: {
      opensAt: Date,
      closesAt: Date,
    },

    status: {
      type: String,
      enum: ["upcoming", "open", "closed", "archived"],
      default: "upcoming",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Semester", semesterSchema);
