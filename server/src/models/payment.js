const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // resolved after matching account number
    academicYear: String,

    method: {
      type: String,
      enum: ["mpesa-c2b", "mpesa-stk", "manual-bank", "manual-cash"],
      required: true,
    },
    amount: { type: Number, required: true },

    // M-Pesa fields — TransID is the idempotency key for C2B confirmations
    transId: { type: String, unique: true, sparse: true },
    accountReference: String, // what the payer typed as account number (should be admission number)
    msisdn: String, // payer's phone
    transTime: Date,

    // manual payment fields
    receiptNumber: String, // bank slip / cash receipt number
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    reconciliationStatus: {
      type: String,
      enum: ["matched", "unmatched", "manual-review"],
      default: "unmatched",
    },
    rawPayload: mongoose.Schema.Types.Mixed, // full Daraja callback, kept for audit
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
