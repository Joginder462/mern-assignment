import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    // For assessment purposes, we'll continue without Redis
    console.log('⚠️ Continuing without Redis (simulation mode)');
  }
}

export async function getFromCache(key: string) {
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache(key: string, data: any, expirySeconds: number = 3600) {
  try {
    await redisClient.setEx(key, expirySeconds, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis invalidate error:', error);
  }
}
