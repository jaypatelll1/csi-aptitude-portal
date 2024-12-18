const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser } = require('../controllers/userController');
const {jwtAuthMiddleware} = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/',jwtAuthMiddleware, updateUser);
router.delete('/',jwtAuthMiddleware, deleteUser);

module.exports = router;