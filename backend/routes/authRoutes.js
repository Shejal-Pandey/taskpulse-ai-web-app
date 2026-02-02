const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    getAllUsers,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, authorize, isManagerOrAdmin } = require('../middleware/auth');

// Generate JWT Token helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Public routes
router.post('/register', register);
router.post('/login', login);

// OTP routes (Public)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Password reset routes (Public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login.html?error=google_auth_failed'
    }),
    (req, res) => {
        // Generate JWT token for the authenticated user
        const token = generateToken(req.user._id);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/oauth-callback.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            department: req.user.department
        }))}`);
    }
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Admin routes
router.get('/users', protect, isManagerOrAdmin, getAllUsers);

module.exports = router;
