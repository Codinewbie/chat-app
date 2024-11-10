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


const userSocketMap = {};
const activeUsersMap = {}; // Track active users (those who have entered the chat room)

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for user identification
  socket.on('identifyUser', (userEmail) => {
    userSocketMap[userEmail] = socket.id;
    console.log(`User ${userEmail} connected with socket ID ${socket.id}`);
  });

  // Listen when a user enters the chat page or room, mark them as active
  socket.on('enterChat', (userEmail) => {
    activeUsersMap[userEmail] = true; // Mark the user as active
    console.log(`User ${userEmail} entered the chat`);
    
    // Emit the updated active users list
    io.emit('activeUsers', Object.keys(activeUsersMap));
  });

  // Join room for one-to-one chat
 socket.on('joinRoom', ({ senderEmail, receiverEmail }) => {
    const roomId = [senderEmail, receiverEmail].sort().join('-');
    socket.join(roomId);
    console.log(`User with email ${senderEmail} joined room ${roomId}`);
  });

  socket.on('sendMessage', (messageData) => {
    const { senderEmail, receiverEmail } = messageData;
    const roomId = [senderEmail, receiverEmail].sort().join('-');
    
    // Emit the message to users in the room
    io.to(roomId).emit('receiveMessage', messageData);

    console.log(`Message sent from ${senderEmail} to ${receiverEmail} in room ${roomId}`);
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    // Remove the user from userSocketMap
    for (const email in userSocketMap) {
      if (userSocketMap[email] === socket.id) {
        delete userSocketMap[email];
        break;
      }
    }
// Remove from active users if the user disconnect
    for (const email in activeUsersMap) {
      if (userSocketMap[email] === socket.id) {
        delete activeUsersMap[email];
        break;
      }
    }
    // Emit the updated active users list, removing the disconnected user
    io.emit('activeUsers', Object.keys(activeUsersMap));

    
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
