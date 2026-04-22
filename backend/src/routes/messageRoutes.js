const express = require('express');
const router = express.Router();
const { getConversations, getMessages, createConversation, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);
module.exports = router;
