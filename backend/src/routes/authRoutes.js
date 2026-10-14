const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/signup (or /api/auth/register)
router.post(['/signup', '/register'], authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me (Protected via JWT)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
