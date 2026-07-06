const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // reusing teammate's existing middleware

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes - require a valid JWT
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateProfile);

module.exports = router;