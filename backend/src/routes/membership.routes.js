const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/membership.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/me/memberships", requireAuth, membershipController.myMemberships);
router.get("/me/access", requireAuth, membershipController.myAccessStatus);

router.get(
  "/admin/users",
  requireAuth,
  requireRole("ADMIN"),
  membershipController.adminListUsers
);

router.post(
  "/admin/memberships/activate",
  requireAuth,
  requireRole("ADMIN"),
  membershipController.activateMembership
);

router.post(
  "/admin/memberships/:id/suspend",
  requireAuth,
  requireRole("ADMIN"),
  membershipController.suspendMembership
);

router.post(
  "/admin/memberships/:id/reactivate",
  requireAuth,
  requireRole("ADMIN"),
  membershipController.reactivateMembership
);

module.exports = router;
