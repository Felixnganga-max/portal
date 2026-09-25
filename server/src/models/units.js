const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    code: { type: String, required: true }, // e.g. "IT201"
    name: { type: String, required: true },
    creditHours: { type: Number, required: true },
    semesterNumber: { type: Number, required: true }, // which semester of the program this unit belongs to
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Unit" }],
    department: String,
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true },
);

unitSchema.index({ institution: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Unit", unitSchema);
