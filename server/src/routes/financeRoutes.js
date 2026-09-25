const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { resolveTenantFromParam } = require("../middleware/tenant");
const finance = require("../controllers/finance.controllers");

// M-Pesa callbacks — public (Safaricom calls these directly, no JWT).
// Register a per-institution callback URL with Daraja so the slug in the
// path resolves the tenant: .../mpesa/c2b-confirmation/:institutionSlug
router.post(
  "/mpesa/c2b-confirmation/:institutionSlug",
  resolveTenantFromParam,
  finance.mpesaC2BConfirmation,
);
router.post(
  "/mpesa/stk-callback/:institutionSlug",
  resolveTenantFromParam,
  finance.mpesaStkCallback,
);

router.use(protect);

// Student
router.get("/my-account", finance.getMyFeeAccount);
router.post("/pay-now", finance.payNow);
router.get("/gate-check", finance.checkGate);

// Admin only
router.post("/fee-structure", restrictTo("admin"), finance.createFeeStructure);
router.post(
  "/manual-payment",
  restrictTo("admin"),
  finance.recordManualPayment,
);
router.post("/waiver", restrictTo("admin"), finance.applyWaiver);
router.post(
  "/helb/bulk-update",
  restrictTo("admin"),
  finance.bulkUpdateHelbStatus,
);
router.get("/arrears-report", restrictTo("admin"), finance.getArrearsReport);

module.exports = router;
