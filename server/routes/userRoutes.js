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
router.put('/update',jwtAuthMiddleware, updateUser);
router.delete('/delete',jwtAuthMiddleware, deleteUser);

module.exports = router;
