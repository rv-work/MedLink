import rateLimit from 'express-rate-limit';

// Rate limiter for chat endpoints
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    type: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60 // in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for localhost in development
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  },
  /*
  keyGenerator: (req, res) => {
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }
    return rateLimit.defaultKeyGenerator(req, res);
  },
  */
  handler: (req, res) => {
    console.log(`Rate limit exceeded for ${req.ip} at ${new Date().toISOString()}`);
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again later.',
      type: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.msBeforeNext / 1000) || 900
    });
  }
});

export default rateLimiter;
