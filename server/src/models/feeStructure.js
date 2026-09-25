const mongoose = require("mongoose");

const feeItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // "Tuition", "Exam Fee", "Library", "Activity Fee", "Caution Money"
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const feeStructureSchema = new mongoose.Schema(
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
    semesterNumber: { type: Number, required: true }, // which semester of the program (1,2,3...)
    academicYear: { type: String, required: true },

    items: [feeItemSchema],
    totalAmount: { type: Number, required: true }, // sum of items, denormalized for fast reads

    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true },
);

feeStructureSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  next();
});

feeStructureSchema.index(
  { institution: 1, program: 1, semesterNumber: 1, academicYear: 1 },
  { unique: true },
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
