const express = require('express');
const router = express.Router();
const authController = require('../controller/Authcontroller'); // Adjust the import path as necessary
const authMiddleware = require('../Middleware/Authmiddleware'); // Adjust the import path as necessary

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;
