const allowRoles = ["student", "coach", "admin"];

export function requireRole(...roles) {
  return (req, res, next) => {
    // 1. Make sure authentication ran first.
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // 2. Reject invalid role configuration.
    if (roles.length === 0 || !roles.every((role) => allowRoles.includes(role))) {
      return res.status(500).json({
        message: "Role authorization is not configured correctly.",
      });
    }

    // 3. Check whether the user has permission.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    // 4. Permission granted: continue to the next handler.
    return next();
  };
}
