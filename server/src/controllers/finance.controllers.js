const FeeStructure = require("../models/FeeStructure");
const StudentFeeAccount = require("../models/StudentFeeAccount");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { initiateStkPush } = require("../utils/mpesa");
const { checkFeeGate } = require("../utils/feeGate");

// ---------- Admin: fee structure config ----------

exports.createFeeStructure = async (req, res) => {
  try {
    const { program, semesterNumber, academicYear, items } = req.body;

    const structure = await FeeStructure.create({
      institution: req.institution._id,
      program,
      semesterNumber,
      academicYear,
      items,
    });

    res.status(201).json(structure);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Called when a student registers for a semester's units — charges their ledger
exports.applyChargeForSemester = async (
  studentId,
  institutionId,
  feeStructure,
  academicYear,
) => {
  let account = await StudentFeeAccount.findOne({
    institution: institutionId,
    student: studentId,
    academicYear,
  });

  if (!account) {
    account = new StudentFeeAccount({
      institution: institutionId,
      student: studentId,
      academicYear,
      entries: [],
    });
  }

  account.entries.push({
    type: "charge",
    description: `Semester ${feeStructure.semesterNumber} fees`,
    amount: feeStructure.totalAmount,
    reference: feeStructure._id.toString(),
  });

  account.recalculate();
  await account.save();
  return account;
};

// ---------- Student: own ledger + pay now ----------

exports.getMyFeeAccount = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const account = await StudentFeeAccount.findOne({
      institution: req.institution._id,
      student: req.user._id,
      academicYear,
    });

    if (!account) {
      return res.json({
        balance: 0,
        percentPaid: 100,
        entries: [],
        helbStatus: "not-applied",
      });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.payNow = async (req, res) => {
  try {
    const { amount } = req.body;
    const student = req.user;

    const stkResponse = await initiateStkPush({
      institution: req.institution,
      phone: student.phone,
      amount,
      accountReference: student.admissionNumber,
      description: "College fees payment",
    });

    res.json({
      message: "STK push sent",
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to initiate payment", error: err.message });
  }
};

// ---------- M-Pesa callbacks (idempotent by TransID) ----------

// C2B confirmation — student pays directly via Paybill + account number (admission number)
exports.mpesaC2BConfirmation = async (req, res) => {
  try {
    const { TransID, TransAmount, BillRefNumber, MSISDN, TransTime } = req.body;

    // idempotency guard — Safaricom retries callbacks, TransID is unique
    const existing = await Payment.findOne({ transId: TransID });
    if (existing) {
      return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const student = await User.findOne({
      institution: req.institution._id,
      admissionNumber: BillRefNumber.trim().toUpperCase(),
      role: "student",
    });

    const payment = await Payment.create({
      institution: req.institution._id,
      student: student ? student._id : null,
      method: "mpesa-c2b",
      amount: Number(TransAmount),
      transId: TransID,
      accountReference: BillRefNumber,
      msisdn: MSISDN,
      transTime: TransTime,
      reconciliationStatus: student ? "matched" : "unmatched",
      rawPayload: req.body,
    });

    if (student) {
      const currentYear = new Date().getFullYear().toString();
      let account = await StudentFeeAccount.findOne({
        institution: req.institution._id,
        student: student._id,
        academicYear: currentYear,
      });

      if (!account) {
        account = new StudentFeeAccount({
          institution: req.institution._id,
          student: student._id,
          academicYear: currentYear,
          entries: [],
        });
      }

      account.entries.push({
        type: "payment",
        description: "M-Pesa payment",
        amount: payment.amount,
        reference: payment._id.toString(),
      });
      account.recalculate();
      await account.save();
    }

    // Safaricom requires this exact response shape to stop retries
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    // still ack Safaricom to avoid repeated retries; log for manual review internally
    console.error("C2B confirmation error:", err.message);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

exports.mpesaStkCallback = async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;
    if (callback.ResultCode !== 0) {
      return res.json({ ResultCode: 0, ResultDesc: "Received" }); // payment failed/cancelled by user
    }

    const metadata = callback.CallbackMetadata.Item;
    const getVal = (name) => metadata.find((i) => i.Name === name)?.Value;

    const transId = getVal("MpesaReceiptNumber");
    const amount = getVal("Amount");
    const phone = String(getVal("PhoneNumber"));

    const existing = await Payment.findOne({ transId });
    if (existing) {
      return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const student = await User.findOne({
      phone: phone.slice(-9),
      role: "student",
    });

    const payment = await Payment.create({
      institution: req.institution._id,
      student: student ? student._id : null,
      method: "mpesa-stk",
      amount,
      transId,
      msisdn: phone,
      reconciliationStatus: student ? "matched" : "unmatched",
      rawPayload: req.body,
    });

    if (student) {
      const currentYear = new Date().getFullYear().toString();
      let account = await StudentFeeAccount.findOne({
        institution: req.institution._id,
        student: student._id,
        academicYear: currentYear,
      });
      if (!account) {
        account = new StudentFeeAccount({
          institution: req.institution._id,
          student: student._id,
          academicYear: currentYear,
          entries: [],
        });
      }
      account.entries.push({
        type: "payment",
        description: "M-Pesa STK payment",
        amount: payment.amount,
        reference: payment._id.toString(),
      });
      account.recalculate();
      await account.save();
    }

    res.json({ ResultCode: 0, ResultDesc: "Received" });
  } catch (err) {
    console.error("STK callback error:", err.message);
    res.json({ ResultCode: 0, ResultDesc: "Received" });
  }
};

// ---------- Admin: manual payments, waivers, HELB ----------

exports.recordManualPayment = async (req, res) => {
  try {
    const { studentId, amount, method, receiptNumber, academicYear } = req.body;

    const payment = await Payment.create({
      institution: req.institution._id,
      student: studentId,
      method, // 'manual-bank' | 'manual-cash'
      amount,
      receiptNumber,
      recordedBy: req.user._id,
      reconciliationStatus: "matched",
    });

    let account = await StudentFeeAccount.findOne({
      institution: req.institution._id,
      student: studentId,
      academicYear,
    });
    if (!account) {
      account = new StudentFeeAccount({
        institution: req.institution._id,
        student: studentId,
        academicYear,
        entries: [],
      });
    }

    account.entries.push({
      type: "payment",
      description: `Manual payment (${method}) - receipt ${receiptNumber}`,
      amount,
      reference: payment._id.toString(),
      recordedBy: req.user._id,
    });
    account.recalculate();
    await account.save();

    res.status(201).json({ payment, account });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.applyWaiver = async (req, res) => {
  try {
    const { studentId, amount, academicYear, reason } = req.body;

    const account = await StudentFeeAccount.findOne({
      institution: req.institution._id,
      student: studentId,
      academicYear,
    });
    if (!account)
      return res.status(404).json({ message: "Fee account not found" });

    account.entries.push({
      type: "waiver",
      description: reason || "Fee waiver",
      amount,
      recordedBy: req.user._id,
    });
    account.recalculate();
    await account.save();

    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// bulk HELB status update — admin pastes/uploads the HELB disbursement CSV data
exports.bulkUpdateHelbStatus = async (req, res) => {
  try {
    const { records } = req.body; // [{ admissionNumber, status, amount }]
    const results = [];

    for (const record of records) {
      const student = await User.findOne({
        institution: req.institution._id,
        admissionNumber: record.admissionNumber,
        role: "student",
      });
      if (!student) {
        results.push({ ...record, error: "Student not found" });
        continue;
      }

      const academicYear = new Date().getFullYear().toString();
      let account = await StudentFeeAccount.findOne({
        institution: req.institution._id,
        student: student._id,
        academicYear,
      });
      if (!account) {
        account = new StudentFeeAccount({
          institution: req.institution._id,
          student: student._id,
          academicYear,
          entries: [],
        });
      }

      account.helbStatus = record.status;
      account.helbAmount = record.amount;
      account.helbLastUpdated = new Date();
      await account.save();
      results.push({ ...record, success: true });
    }

    res.json({ results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---------- Fee gate check (used by registration/exam-card/transcript flows) ----------

exports.checkGate = async (req, res) => {
  try {
    const { gateType, academicYear } = req.query;
    const result = await checkFeeGate({
      institution: req.institution,
      student: req.user._id,
      academicYear,
      gateType,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Admin: all-student ledger / arrears report ----------

exports.getArrearsReport = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const accounts = await StudentFeeAccount.find({
      institution: req.institution._id,
      academicYear,
      balance: { $gt: 0 },
    })
      .populate("student", "fullName admissionNumber program phone")
      .sort({ balance: -1 });

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
