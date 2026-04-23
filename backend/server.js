require('dotenv').config();

console.log("BOOT: server file loaded");

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');

// Import configuration
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { rateLimiter } = require('./src/middleware/rateLimit');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const codeRoutes = require('./src/routes/codeRoutes');
const scanRoutes = require('./src/routes/scanRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Import WebSocket handler
const { setupSocket } = require('./src/websocket/socketHandler');

// ========================
// INIT APP
// ========================
const app = express();
const server = http.createServer(app);

// ========================
// HEALTH CHECK (VERY IMPORTANT - MUST BE FIRST)
// ========================
app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

// ========================
// SOCKET IO
// ========================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ========================
// MIDDLEWARE
// ========================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
app.use('/api/', rateLimiter);

// ========================
// ROUTES
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/analytics', analyticsRoutes);

// ========================
// SOCKET SETUP
// ========================
setupSocket(io);

// ========================
// ERROR HANDLER
// ========================
app.use(errorHandler);

// ========================
// START SERVER (NON-BLOCKING DB)
// ========================
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);

  // DB connect AFTER server is live (IMPORTANT FIX)
  connectDB()
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err));
});

// ========================
// GRACEFUL SHUTDOWN
// ========================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };