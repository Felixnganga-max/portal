const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    name: { type: String, required: true }, // e.g. "Diploma in Information Technology"
    code: { type: String, required: true },
    level: {
      type: String,
      enum: ["certificate", "diploma", "higher-diploma", "artisan"],
      required: true,
    },
    durationSemesters: { type: Number, required: true }, // e.g. 6 for a 3-year diploma
    creditHoursRequired: Number,
    department: String,
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true },
);

programSchema.index({ institution: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Program", programSchema);
