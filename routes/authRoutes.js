const express = require('express');
const { register, login } = require('../controllers/authController');
const basicAuth = require('../middleware/basicAuth');

const router = express.Router();

router.post('/register', register);
router.post('/login', basicAuth,login);

module.exports = router;
