const Message = require('../models/Message');
const User = require('../models/user');

// Get chat messages between two users
exports.getMessages = async (req, res) => {
  const { senderEmail, receiverEmail } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderEmail: senderEmail, receiverEmail: receiverEmail },
        { senderEmail: receiverEmail, receiverEmail: senderEmail }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const { senderEmail, receiverEmail, content } = req.body;
  try {
    const newMessage = new Message({ senderEmail: senderEmail, receiverEmail: receiverEmail, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error sending message' });
  }
};
