const express = require('express');
const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

router.post('/register', jwtAuthMiddleware, authorizeRoles, registerUser);
router.post('/login', loginUser);
router.put('/', jwtAuthMiddleware, authorizeRoles, updateUser);
router.delete('/', jwtAuthMiddleware, authorizeRoles, deleteUser);

module.exports = router;
