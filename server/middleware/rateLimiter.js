import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../config/redis.js";


const loginLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rl_login",
    points:7,      
    duration: 30,
});

export const rateLimitLogin = async (req, res, next) => {
    try {
        await loginLimiter.consume(req.ip);
        next();
    } catch {
        res.status(429).json({ message: "Too many login attempts. Wait a minute." });
    }
};

const ipLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_ip",
  points: 100,  
  duration: 30,  
});


const uploadLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_upload",
  points: 10,  
  duration: 30, 
});

export const rateLimitIP = async (req, res, next) => {
  try {
    await ipLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests. Slow down." });
  }
};

export const rateLimitUpload = async (req, res, next) => {
  try {
   
    await uploadLimiter.consume(req.user?._id || req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Upload limit reached. Try after a minute." });
  }
};