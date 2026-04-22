const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { setupSocket } = require('./sockets');
const cronJobs = require('./jobs/cronJobs');

dotenv.config();

const app = require('./app');
const server = http.createServer(app);
const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = process.env.NODE_ENV === 'development'
  ? [...new Set([...defaultDevOrigins, ...envOrigins])]
  : envOrigins;
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Setup Socket.IO
setupSocket(io);

// Initialize cron jobs
cronJobs.start();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
