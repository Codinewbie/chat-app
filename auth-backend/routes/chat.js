const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Assuming you have a Message model
const { getMessages, sendMessage } = require('../controllers/chatController');

// Get all messages between two users by their email IDs
router.get('/:senderEmail/:receiverEmail', getMessages);

// Send a new message
router.post('/send', sendMessage);

module.exports = router;
