const StudentFeeAccount = require("../models/StudentFeeAccount");

/**
 * gateType: 'registration' | 'examCard' | 'transcript'
 * Returns { allowed: boolean, percentPaid, thresholdRequired }
 */
const checkFeeGate = async ({
  institution,
  student,
  academicYear,
  gateType,
}) => {
  const thresholdMap = {
    registration: institution.feeGate.registrationThresholdPercent,
    examCard: institution.feeGate.examCardThresholdPercent,
    transcript: institution.feeGate.transcriptThresholdPercent,
  };
  const thresholdRequired = thresholdMap[gateType] ?? 0;

  if (thresholdRequired <= 0) {
    return { allowed: true, percentPaid: null, thresholdRequired };
  }

  const account = await StudentFeeAccount.findOne({
    institution: institution._id,
    student,
    academicYear,
  });

  const percentPaid = account ? account.percentPaid : 0;

  return {
    allowed: percentPaid >= thresholdRequired,
    percentPaid,
    thresholdRequired,
  };
};

module.exports = { checkFeeGate };
