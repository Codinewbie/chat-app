const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { register, login, users } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/users', authMiddleware, users); // New route to get all registered users

module.exports = router;
