const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser, getAllPaginatedUsers } = require('../controllers/userController');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

router.post('/register', jwtAuthMiddleware, authorizeRoles, registerUser);
router.post('/login', loginUser);
router.get('/', jwtAuthMiddleware, authorizeRoles, getAllPaginatedUsers); // pagination
router.put('/update/:user_id', jwtAuthMiddleware, authorizeRoles, updateUser);
router.delete('/delete/:user_id', jwtAuthMiddleware, authorizeRoles, deleteUser);

module.exports = router;

