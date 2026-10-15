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
