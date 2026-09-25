const Institution = require("../models/institution");

/**
 * M-Pesa callbacks have no JWT, so the institution must be resolved another way.
 * Simplest approach: register a distinct callback URL per institution, e.g.
 * /api/v1/finance/mpesa/c2b-confirmation/:institutionSlug — Daraja calls that
 * exact URL, so req.params carries the tenant.
 * Wire this middleware in server.js ahead of the finance routes for those two paths.
 */
const resolveTenantFromParam = async (req, res, next) => {
  try {
    const institution = await Institution.findOne({
      slug: req.params.institutionSlug,
    });
    if (!institution) {
      return res.status(404).json({ message: "Unknown institution" });
    }
    req.institution = institution;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { resolveTenantFromParam };
