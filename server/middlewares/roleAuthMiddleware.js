// Role-based authorization middleware
const authorizeRoles = (req, res, next) => {
  if (req.user.role !== 'TPO' && req.user.role !== 'Department') {
    return res
      .status(403)
      .json({ message: 'Access denied. Insufficient permissions.' });
  }
  next();
};

module.exports = { authorizeRoles };
