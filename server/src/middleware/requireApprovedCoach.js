import User from "../models/User";

export const requireApprovedCoach = async (req, res, next) => {
  try {
    // AuthenicateToken must run first

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(req.user.id).select("_id role isActive coachApprovalStatus").lean();

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (user.role !== "coach") {
      return res.status(403).json({
        success: false,
        message: "Coach access only.",
      });
    }

    if (user.coachApprovalStatus !== "approved") {
      const status = user.coachApprovalStatus ?? "pending";

      return res.status(403).json({
        success: false,
        message:
          status === "rejected"
            ? "Your coach application was rejected. Please contact the administrator."
            : "Your coach account is awaiting admin approval.",
        coachApprovalStatus: status,
      });
    }

    return next();
  } catch (error) {
    console.error("Coach approval check failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify coach approval.",
    });
  }
};
