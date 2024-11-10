require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Maintain a socket map to handle user sessions
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for user identification
  socket.on('identifyUser', (userEmail) => {
    userSocketMap[userEmail] = socket.id;
    console.log(`User ${userEmail} connected with socket ID ${socket.id}`);
  });

  // Join room for one-to-one chat
  socket.on('joinRoom', ({ senderEmail, receiverEmail }) => {
    const roomId = [senderEmail, receiverEmail].sort().join('-');
    socket.join(roomId);
    console.log(`User with email ${senderEmail} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', (messageData) => {
    const { senderEmail, receiverEmail } = messageData;
    const roomId = [senderEmail, receiverEmail].sort().join('-');
    
    // Emit the message to users in the room
    io.to(roomId).emit('receiveMessage', messageData);

    console.log(`Message sent from ${senderEmail} to ${receiverEmail} in room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Remove the user from userSocketMap
    for (const email in userSocketMap) {
      if (userSocketMap[email] === socket.id) {
        delete userSocketMap[email];
        break;
      }
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
