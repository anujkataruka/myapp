import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../server';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyspace: 'grocery_app_rate_limiter',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900'), // Per 15 minutes (900 seconds)
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: secs,
      timestamp: new Date().toISOString()
    });
  }
};

export { rateLimiter };