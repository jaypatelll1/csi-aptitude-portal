const ipGuardianService = require('../services/ipGuardianService');

// Request logging middleware
const securityLogger = (req, res, next) => {
  req.startTime = Date.now();
  
  // Log request completion
  res.on('finish', () => {
    ipGuardianService.addLogEntry(req, res);
  });
  
  next();
};

// IP blocking middleware (checks database)
const ipBlocker = async (req, res, next) => {
  try {
    const clientIP = ipGuardianService.extractClientIP(req);
    const blockInfo = await ipGuardianService.isIPBlocked(clientIP);
    
    if (blockInfo) {
      // Log the block attempt
      const logger = require('winston').createLogger({
        transports: [new (require('winston')).transports.File({ filename: 'logs/blocked-attempts.log' })]
      });
      
      logger.warn('Blocked IP attempted access', {
        ip: clientIP,
        endpoint: req.originalUrl,
        method: req.method,
        user_agent: req.get('User-Agent'),
        blocked_at: blockInfo.blocked_at,
        risk_level: blockInfo.risk_level
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied - Your IP has been blocked due to suspicious activity',
        blocked_at: blockInfo.blocked_at,
        risk_level: blockInfo.risk_level,
        reasons: blockInfo.reasons || ['Suspicious behavior detected'],
        contact: 'If you believe this is an error, please contact support',
        expires_at: blockInfo.expires_at
      });
    }
    
    next();
  } catch (error) {
    // If database check fails, log but don't block (fail open)
    console.error('IP blocking check failed:', error.message);
    next();
  }
};

module.exports = {
  securityLogger,
  ipBlocker
};
