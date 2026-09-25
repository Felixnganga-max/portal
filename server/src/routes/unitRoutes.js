const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const units = require("../controllers/unitController");

router.use(protect);

// Student
router.get("/registrable", restrictTo("student"), units.getRegistrableUnits);
router.post("/register", restrictTo("student"), units.registerUnit);
router.patch("/registrations/:id/drop", restrictTo("student"), units.dropUnit);

// Shared (student sees own, admin/instructor pass :studentId)
router.get(
  "/registrations/mine",
  restrictTo("student"),
  units.getMyRegisteredUnits,
);
router.get(
  "/registrations/student/:studentId",
  restrictTo("admin", "instructor"),
  units.getMyRegisteredUnits,
);

// Admin only
router.post(
  "/admin/force-register",
  restrictTo("admin"),
  units.adminForceRegister,
);

module.exports = router;
