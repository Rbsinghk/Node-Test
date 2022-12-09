const express = require('express');
const router = new express.Router();
const registerController = require('../controllers/register');
const auth = require('../middleware/auth');

router.post('/users/signup', registerController.register);
router.post('/users/login', registerController.login);
router.get('/users/me', auth, registerController.getProfile);
router.get('/users/logout', registerController.logout);
router.get('/random-joke', registerController.getJokes);

module.exports = router;