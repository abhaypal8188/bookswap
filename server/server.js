const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/exchange', exchangeRoutes);

// Socket.io for Real-time Chat & Notifications
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room based on userId for personal notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join an exchange chat room
  socket.on('join_chat', (exchangeId) => {
    socket.join(exchangeId);
    console.log(`User joined chat room: ${exchangeId}`);
  });

  // Handle messages
  socket.on('send_message', (data) => {
    const { exchangeId, senderId, message } = data;
    // Broadcast to the room
    io.to(exchangeId).emit('receive_message', { senderId, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes if needed
app.set('io', io);

// Database Connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    if (process.env.NODE_ENV !== 'production') {
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// Export for serverless deployment
module.exports = app;

