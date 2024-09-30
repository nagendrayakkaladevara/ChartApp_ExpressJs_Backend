const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
// const authMiddleware = require('../middleware/authMiddleware');
const basicAuth = require('../middleware/basicAuth');

const router = express.Router();

router.post('/send', basicAuth, sendMessage);
router.get('/:receiverId', basicAuth, getMessages);

module.exports = router;