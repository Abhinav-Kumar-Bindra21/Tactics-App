import User from "../models/User.js";

export const getAdminStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin authorization successful",
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role isActive createdAt").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Failed to retrieve admin user list:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent an admin from disabling their own account.
    if (user._id.toString() === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Failed to update user status:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status.",
    });
  }
};
