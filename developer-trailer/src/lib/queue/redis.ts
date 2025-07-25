import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

// Check if we're using local Redis
const isLocalRedis = process.env.UPSTASH_REDIS_REST_URL?.includes('localhost');

// For cloud Redis, check required env vars
if (!isLocalRedis && (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
  console.warn('Using local Redis fallback');
}

// Mock Redis client for local development
const mockRedis = {
  ping: async () => 'PONG',
  set: async (key: string, value: any) => 'OK',
  get: async (key: string) => null,
  del: async (key: string) => 1,
};

// Upstash Redis client for REST API calls
export const upstashRedis = isLocalRedis || !process.env.UPSTASH_REDIS_REST_TOKEN
  ? mockRedis
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

// IORedis client for BullMQ
export function createBullMQConnection(): IORedis {
  if (isLocalRedis || !process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN === 'local') {
    // Local Redis configuration
    return new IORedis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null, // Required for BullMQ
      enableAutoPipelining: true,
      lazyConnect: true,
      retryDelayOnFailover: 100,
    });
  }
  
  // Upstash Redis configuration
  const restUrl = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  
  const host = restUrl.replace('https://', '');
  const port = 6379;
  
  return new IORedis({
    host: host,
    port: port,
    password: token,
    tls: {},
    maxRetriesPerRequest: null, // Required for BullMQ
    enableAutoPipelining: true,
    lazyConnect: true,
  });
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    if (isLocalRedis || !process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN === 'local') {
      const redis = createBullMQConnection();
      await redis.ping();
      redis.disconnect();
    } else {
      await upstashRedis.ping();
    }
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}
