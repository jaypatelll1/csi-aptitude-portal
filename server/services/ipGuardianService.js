const axios = require('axios');
const winston = require('winston');

class IPGuardianService {
  constructor() {
    // Your deployed API endpoint
    this.apiUrl =
      process.env.IP_GUARDIAN_API_URL || 'https://cyberguard2.onrender.com';
    this.logBuffer = [];
    this.maxBufferSize = 50;

    // Configure logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
      ],
    });
  }

  // Extract real client IP
  extractClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip
    );
  }

  // Add log entry to buffer
  addLogEntry(req, res) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip_address: this.extractClientIP(req),
      method: req.method,
      endpoint: req.originalUrl,
      status_code: res.statusCode,
      response_size: res.get('Content-Length') || 0,
      user_agent: req.get('User-Agent') || '',
      referer: req.get('Referer') || '',
      response_time: Date.now() - req.startTime,
    };

    this.logBuffer.push(logEntry);

    // Process logs when buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.processLogBuffer();
    }
  }

  // Process log buffer and send to your external API
  async processLogBuffer() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    const ipGroups = this.groupLogsByIP(logs);

    for (const [ip, ipLogs] of ipGroups) {
      try {
        const analysis = await this.analyzeIPWithExternalAPI(ip, ipLogs);

        // If should_block is true, store in database
        if (analysis.should_block) {
          await this.storeBlockedIP(ip, analysis);
        }
      } catch (error) {
        this.logger.error('Failed to analyze IP', { ip, error: error.message });
      }
    }
  }

  // Group logs by IP address
  groupLogsByIP(logs) {
    const groups = new Map();
    logs.forEach((log) => {
      if (!groups.has(log.ip_address)) {
        groups.set(log.ip_address, []);
      }
      groups.get(log.ip_address).push(log);
    });
    return groups;
  }

  // Analyze IP using your external API
  async analyzeIPWithExternalAPI(ip, logs) {
    try {
      // Format logs for your API
      const logData = logs
        .map(
          (log) =>
            `${log.ip_address} - - [${log.timestamp}] "${log.method} ${log.endpoint}" ${log.status_code} ${log.response_size} "${log.referer}" "${log.user_agent}"`
        )
        .join('\n');

      // Call your deployed API
      const response = await axios.post(
        `${this.apiUrl}/api/v1/analyze-ip`,
        {
          ip: ip,
          log_data: logData,
          user_agent: logs[0]?.user_agent || '',
          context: {
            source: 'pern-app',
            timestamp: new Date().toISOString(),
            total_requests: logs.length,
          },
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const analysis = response.data.data;

        this.logger.info('IP Analysis Result', {
          ip,
          should_block: analysis.should_block,
          risk_level: analysis.risk_level,
          confidence_score: analysis.confidence_score,
          cached: analysis.cached,
        });

        return analysis;
      }

      throw new Error('External API analysis failed');
    } catch (error) {
      this.logger.error('External API call failed', {
        ip,
        error: error.message,
      });
      throw error;
    }
  }

  // Store blocked IP in your database
  async storeBlockedIP(ip, analysis) {
    try {
      const db = require('../config/database'); // Your existing DB connection
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const query = `
        INSERT INTO blocked_ips 
        (ip_address, risk_level, confidence_score, reasons, threat_types, expires_at, analysis_details, blocked_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (ip_address) DO UPDATE SET
        blocked_at = NOW(),
        expires_at = $6,
        analysis_details = $7,
        confidence_score = $2
      `;

      await db.query(query, [
        ip,
        analysis.risk_level,
        analysis.confidence_score,
        analysis.reasons,
        analysis.threat_types,
        expiresAt,
        JSON.stringify(analysis),
      ]);

      this.logger.warn('IP blocked and stored', {
        ip,
        risk_level: analysis.risk_level,
        confidence_score: analysis.confidence_score,
        reasons: analysis.reasons,
      });
    } catch (error) {
      this.logger.error('Failed to store blocked IP', {
        ip,
        error: error.message,
      });
    }
  }

  // Check if IP is blocked (from database)
  async isIPBlocked(ip) {
    try {
      const db = require('../config/database');
      const result = await db.query(
        `SELECT * FROM blocked_ips 
         WHERE ip_address = $1 AND expires_at > NOW()`,
        [ip]
      );

      return result.rows[0] || false;
    } catch (error) {
      this.logger.error('Failed to check blocked IP', {
        ip,
        error: error.message,
      });
      return false;
    }
  }

  // Get statistics
  async getStats() {
    try {
      const db = require('../config/database');
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_blocked,
          COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_blocked,
          COUNT(CASE WHEN blocked_at > NOW() - INTERVAL '24 hours' THEN 1 END) as blocked_today
        FROM blocked_ips
      `);

      return {
        total_blocked: parseInt(result.rows[0].total_blocked),
        active_blocked: parseInt(result.rows[0].active_blocked),
        blocked_today: parseInt(result.rows[0].blocked_today),
        buffer_size: this.logBuffer.length,
        api_endpoint: this.apiUrl,
      };
    } catch (error) {
      this.logger.error('Failed to get stats', { error: error.message });
      return {
        total_blocked: 0,
        active_blocked: 0,
        blocked_today: 0,
        buffer_size: this.logBuffer.length,
        api_endpoint: this.apiUrl,
      };
    }
  }
}

module.exports = new IPGuardianService();
