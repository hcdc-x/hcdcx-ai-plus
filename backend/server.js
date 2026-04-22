require('dotenv').config();

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

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/analytics', analyticsRoutes);

// WebSocket setup
setupSocket(io);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  logger.info(`🚀 HCDC-X AI+ Backend running on port ${PORT}`);
  logger.info(`🔌 WebSocket server ready`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
