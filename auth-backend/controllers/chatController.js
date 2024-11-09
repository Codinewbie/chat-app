const Message = require('../models/Message');
const User = require('../models/user');

// Get chat messages between two users
exports.getMessages = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const newMessage = new Message({ sender: senderId, receiver: receiverId, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error sending message' });
  }
};
