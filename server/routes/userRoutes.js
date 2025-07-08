const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser, getAllPaginatedUsers, verifyResetToken ,resetPassword, sendResetEmail , logout } = require('../controllers/userController');
const { jwtAuthMiddleware, } = require('../middlewares/jwtAuthMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const {blockMobileMiddleware}= require ("../middlewares/blockMoblieMiddleware")
const {registerUserValidator, loginUserValidator, updateUserValidator} = require("../middlewares/userValidator");
const singleLoginMiddleware = require('../middleware/singleLoginMiddleware');
const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');


router.post('/register', registerUserValidator, jwtAuthMiddleware, authorizeRoles, registerUser);

router.post('/login', loginUserValidator,blockMobileMiddleware,loginUser);

router.get('/', jwtAuthMiddleware, authorizeRoles, getAllPaginatedUsers); 
router.put('/update/:user_id', updateUserValidator,jwtAuthMiddleware, authorizeRoles, updateUser);
router.delete('/delete/:user_id', jwtAuthMiddleware, authorizeRoles, deleteUser);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password',  resetPassword);
router.post('/send-reset-mail', jwtAuthMiddleware, sendResetEmail);
router.post("/logout",logout)
router.get('/dashboard', singleLoginMiddleware, userController.dashboard);
router.get('/profile', singleLoginMiddleware, userController.profile);

module.exports = router;



