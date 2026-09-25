const Unit = require("../models/Unit");
const UnitRegistration = require("../models/unitRegistration");
const Semester = require("../models/Semester");
const { checkFeeGate } = require("../utils/feeGate");

// Student: list units available to register for, in their program + current semester number
exports.getRegistrableUnits = async (req, res) => {
  try {
    const student = req.user;
    const units = await Unit.find({
      institution: req.institution._id,
      program: student.program,
      status: "active",
    });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerUnit = async (req, res) => {
  try {
    const { unitId, semesterId } = req.body;
    const student = req.user;

    const semester = await Semester.findById(semesterId);
    if (!semester || semester.status !== "open") {
      return res
        .status(400)
        .json({ message: "Registration window is not open" });
    }

    // fee gate check
    const gate = await checkFeeGate({
      institution: req.institution,
      student: student._id,
      academicYear: semester.academicYear,
      gateType: "registration",
    });
    if (!gate.allowed) {
      return res.status(403).json({
        message: `Fee balance too high to register (${gate.percentPaid}% paid, ${gate.thresholdRequired}% required)`,
      });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    // prerequisite check
    if (unit.prerequisites?.length) {
      const completed = await UnitRegistration.find({
        student: student._id,
        unit: { $in: unit.prerequisites },
        status: "completed",
      });
      if (completed.length < unit.prerequisites.length) {
        return res
          .status(400)
          .json({ message: "Prerequisite unit(s) not yet completed" });
      }
    }

    const registration = await UnitRegistration.create({
      institution: req.institution._id,
      student: student._id,
      unit: unitId,
      semester: semesterId,
      registeredBy: "self",
    });

    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Already registered for this unit this semester" });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.dropUnit = async (req, res) => {
  try {
    const registration = await UnitRegistration.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      { status: "dropped" },
      { new: true },
    );
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });
    res.json(registration);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Student/Admin: units in progress for a given semester (or current, if unspecified)
exports.getMyRegisteredUnits = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id; // admin can pass a studentId
    const { semesterId } = req.query;

    const filter = {
      institution: req.institution._id,
      student: studentId,
      status: "registered",
    };
    if (semesterId) filter.semester = semesterId;

    const registrations = await UnitRegistration.find(filter)
      .populate("unit", "code name creditHours")
      .populate("instructor", "fullName");

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: force-register or force-drop (bypasses fee gate + registration window)
exports.adminForceRegister = async (req, res) => {
  try {
    const { studentId, unitId, semesterId, instructorId } = req.body;

    const registration = await UnitRegistration.create({
      institution: req.institution._id,
      student: studentId,
      unit: unitId,
      semester: semesterId,
      instructor: instructorId,
      registeredBy: "admin",
    });

    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
