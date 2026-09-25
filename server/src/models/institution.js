const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // subdomain / tenant key
    logoUrl: String,
    themeColor: { type: String, default: "#0B5FFF" }, // tenant color token

    // M-Pesa Daraja credentials, per-institution (not .env — same pattern as ShulebOra)
    mpesaConfig: {
      paybillNumber: String,
      consumerKey: String,
      consumerSecret: String,
      passkey: String,
      shortcode: String,
      isLive: { type: Boolean, default: false },
    },

    // fee gating configuration
    feeGate: {
      examCardThresholdPercent: { type: Number, default: 80 },
      registrationThresholdPercent: { type: Number, default: 0 }, // 0 = no gate at registration
      transcriptThresholdPercent: { type: Number, default: 100 },
    },

    smsProvider: {
      apiKey: String,
      username: String, // Africa's Talking
    },

    status: {
      type: String,
      enum: ["active", "trial", "suspended"],
      default: "trial",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Institution", institutionSchema);
