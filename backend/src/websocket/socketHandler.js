const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { getSecurityMetrics } = require('../services/securityService');

/**
 * Setup Socket.IO event handlers
 */
const setupSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      
      next();
    } catch (error) {
      logger.error(`Socket auth error: ${error.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    
    logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

    // Join user-specific room
    socket.join(`user-${userId}`);
    
    // Admin joins admin room
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    // Handle dashboard subscription
    socket.on('dashboard:subscribe', async () => {
      try {
        socket.join(`dashboard-${userId}`);
        
        // Send initial security metrics
        const metrics = await getSecurityMetrics(userId);
        socket.emit('stats:update', metrics);
        socket.emit('security:update', metrics);
        
        logger.debug(`User ${userId} subscribed to dashboard`);
      } catch (error) {
        logger.error(`Dashboard subscription error: ${error.message}`);
        socket.emit('error', { message: 'Failed to load dashboard data' });
      }
    });

    // Handle dashboard unsubscription
    socket.on('dashboard:unsubscribe', () => {
      socket.leave(`dashboard-${userId}`);
      logger.debug(`User ${userId} unsubscribed from dashboard`);
    });

    // Handle code room subscription (for specific code updates)
    socket.on('code:subscribe', (codeId) => {
      if (codeId) {
        socket.join(`code-${codeId}`);
        logger.debug(`Socket ${socket.id} subscribed to code ${codeId}`);
      }
    });

    socket.on('code:unsubscribe', (codeId) => {
      if (codeId) {
        socket.leave(`code-${codeId}`);
      }
    });

    // Handle scan events (emitted from scan controller)
    socket.on('scan:new', (scanData) => {
      // This is typically emitted by the server, but clients can trigger re-broadcast
      if (scanData && scanData.codeId) {
        // Forward to code room and user room
        io.to(`code-${scanData.codeId}`).emit('scan:update', scanData);
        logger.debug(`Scan broadcasted for code ${scanData.codeId}`);
      }
    });

    // Handle analytics subscription
    socket.on('analytics:subscribe', () => {
      socket.join(`analytics-${userId}`);
      logger.debug(`User ${userId} subscribed to analytics`);
    });

    socket.on('analytics:unsubscribe', () => {
      socket.leave(`analytics-${userId}`);
    });

    // Handle security alerts subscription
    socket.on('security:subscribe', () => {
      socket.join(`security-${userId}`);
      logger.debug(`User ${userId} subscribed to security alerts`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${userId}) - Reason: ${reason}`);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  // Attach io instance to app for use in controllers
  return io;
};

/**
 * Emit scan event to relevant rooms
 */
const emitScanEvent = (io, scanData) => {
  const { codeId, userId } = scanData;
  
  // Emit to code-specific room
  if (codeId) {
    io.to(`code-${codeId}`).emit('scan:new', scanData);
  }
  
  // Emit to code owner's dashboard
  if (userId) {
    io.to(`user-${userId}`).emit('scan:new', scanData);
    io.to(`dashboard-${userId}`).emit('scan:new', scanData);
  }
  
  // Emit to admin room
  io.to('admin').emit('scan:new', scanData);
};

/**
 * Emit security alert
 */
const emitSecurityAlert = (io, userId, alertData) => {
  if (userId) {
    io.to(`security-${userId}`).emit('security:alert', alertData);
    io.to(`dashboard-${userId}`).emit('security:alert', alertData);
  }
  
  // High-risk alerts also go to admin
  if (alertData.score >= 70) {
    io.to('admin').emit('security:alert', alertData);
  }
};

/**
 * Emit analytics update
 */
const emitAnalyticsUpdate = (io, userId, data) => {
  if (userId) {
    io.to(`analytics-${userId}`).emit('analytics:update', data);
  }
};

module.exports = {
  setupSocket,
  emitScanEvent,
  emitSecurityAlert,
  emitAnalyticsUpdate,
};
