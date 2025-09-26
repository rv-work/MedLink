import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please slow down',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Special rate limiter for ML endpoints (more restrictive)
export const mlRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit ML requests to 20 per 10 minutes
  message: {
    error: 'ML processing limit exceeded, please try again later.',
    retryAfter: '10 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'ML processing limit exceeded',
      message: 'Too many ML analysis requests, please wait before trying again',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

export default rateLimiter;