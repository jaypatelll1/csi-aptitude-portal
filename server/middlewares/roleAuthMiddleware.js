// Role-based authorization middleware
const authorizeRoles = (req, res, next) => {
  if (req.user.role !== 'TPO') {
    return res
      .status(403)
      .json({ message: 'Access denied. Insufficient permissions.' });
  }
  next();
};

module.exports = { authorizeRoles };
