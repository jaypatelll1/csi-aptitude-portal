const express = require('express');

const { registerUser, loginUser, updateUser, deleteUser, getAllPaginatedUsers, verifyResetToken ,resetPassword, sendResetEmail , logout } = require('../controllers/userController');
const { jwtAuthMiddleware, } = require('../middlewares/jwtAuthMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const userController = require('../controllers/userController'); 

const router = express.Router();


router.post('/register', jwtAuthMiddleware, authorizeRoles, registerUser);

router.post('/login', loginUser);

router.get('/', jwtAuthMiddleware, authorizeRoles, getAllPaginatedUsers); 
router.put('/update/:user_id', jwtAuthMiddleware, authorizeRoles, updateUser);
router.delete('/delete/:user_id', jwtAuthMiddleware, authorizeRoles, deleteUser);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password',  resetPassword);
router.post('/send-reset-mail', jwtAuthMiddleware, sendResetEmail);
router.post("/logout",logout)

module.exports = router;



