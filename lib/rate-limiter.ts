// lib/rate-limiter.ts
type RateLimitCache = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

// Simple in-memory cache (for serverless, this is reset on each cold start)
// In production, consider using Redis or a database for persistence
const rateLimitCache: RateLimitCache = {};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  key: string,
  limit: number = 10, // requests
  windowMs: number = 900000 // 15 minutes
): RateLimitResult {
  const now = Date.now();
  const cached = rateLimitCache[key];

  if (!cached) {
    // First request from this key
    rateLimitCache[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }

  // Check if window has passed
  if (now > cached.resetTime) {
    // Reset the window
    rateLimitCache[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }

  // Check if limit is exceeded
  if (cached.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: cached.resetTime
    };
  }

  // Increment count and update cache
  cached.count += 1;
  return {
    allowed: true,
    remaining: limit - cached.count,
    resetTime: cached.resetTime
  };
}

// Enhanced server action wrapper with rate limiting
export function withRateLimit(
  action: Function,
  limit: number = 10,
  windowMs: number = 900000 // 15 minutes
) {
  return async function (...args: any[]) {
    // Create a unique key based on IP and action name
    const identifier = args.length > 0 && args[0]?.user?.id 
      ? `user-${args[0].user.id}-${action.name}`
      : `ip-${getIP()}-${action.name}`;
    
    const result = rateLimit(identifier, limit, windowMs);
    
    if (!result.allowed) {
      throw new Error(`Rate limit exceeded. Try again later.`);
    }
    
    return action(...args);
  };
}

// Simple IP detection helper
function getIP(): string {
  // In Next.js environment, IP might be available in headers
  // This is simplified - you might need more complex IP detection in production
  return 'unknown';
}