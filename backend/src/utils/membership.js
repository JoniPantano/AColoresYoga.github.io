function hasAccessFromMembership(membership, now = new Date()) {
  if (!membership) {
    return { hasAccess: false, reason: "NO_MEMBERSHIP" };
  }

  if (membership.status === "SUSPENDED") {
    return { hasAccess: false, reason: "SUSPENDED" };
  }

  if (membership.status === "CANCELLED") {
    return { hasAccess: false, reason: "CANCELLED" };
  }

  if (membership.status === "ACTIVE" && membership.endDate >= now) {
    return { hasAccess: true, reason: "ACTIVE" };
  }

  if (membership.graceUntil && membership.graceUntil >= now) {
    return { hasAccess: true, reason: "GRACE_PERIOD" };
  }

  return { hasAccess: false, reason: "EXPIRED" };
}

module.exports = {
  hasAccessFromMembership
};
