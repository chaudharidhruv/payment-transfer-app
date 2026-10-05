const express = require('express');
const { getMessages, postMessage } = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, getMessages);
router.post('/', verifyToken, postMessage);

module.exports = router;
