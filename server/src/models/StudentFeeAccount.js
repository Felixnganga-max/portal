const mongoose = require("mongoose");

// A single ledger entry. Charges are positive, payments/waivers are negative
// against the balance owed (i.e. they reduce what's owed).
const ledgerEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["charge", "payment", "waiver", "arrear-carry-forward"],
      required: true,
    },
    description: String,
    amount: { type: Number, required: true }, // always positive; sign is implied by `type`
    reference: String, // FeeStructure id, Payment id, or admin note id
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who logged a manual entry
    date: { type: Date, default: Date.now },
  },
  { _id: true },
);

const studentFeeAccountSchema = new mongoose.Schema(
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
    academicYear: { type: String, required: true },

    openingBalance: { type: Number, default: 0 }, // arrears carried forward
    entries: [ledgerEntrySchema],

    // denormalized for fast dashboard reads; recalculated on every entry push
    totalCharged: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }, // totalCharged - totalPaid - waivers + openingBalance
    percentPaid: { type: Number, default: 0 },

    // HELB is tracked separately — display-only, manually updated or bulk-uploaded
    helbStatus: {
      type: String,
      enum: ["not-applied", "pending", "approved", "disbursed", "rejected"],
      default: "not-applied",
    },
    helbAmount: Number,
    helbLastUpdated: Date,
  },
  { timestamps: true },
);

studentFeeAccountSchema.index(
  { institution: 1, student: 1, academicYear: 1 },
  { unique: true },
);

studentFeeAccountSchema.methods.recalculate = function () {
  let charged = this.openingBalance;
  let paid = 0;

  for (const entry of this.entries) {
    if (entry.type === "charge" || entry.type === "arrear-carry-forward") {
      charged += entry.amount;
    } else if (entry.type === "payment") {
      paid += entry.amount;
    } else if (entry.type === "waiver") {
      charged -= entry.amount;
    }
  }

  this.totalCharged = charged;
  this.totalPaid = paid;
  this.balance = charged - paid;
  this.percentPaid = charged > 0 ? Math.round((paid / charged) * 100) : 100;
};

module.exports = mongoose.model("StudentFeeAccount", studentFeeAccountSchema);
