import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
}

// Upstash Redis client for REST API calls
export const upstashRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// IORedis client for BullMQ (requires Redis URL in redis:// format)
export function createBullMQConnection(): IORedis {
  // Convert Upstash REST URL to Redis URL format for BullMQ
  const restUrl = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  
  // Extract host and port from REST URL
  const urlParts = restUrl.replace('https://', '').split('.');
  const host = restUrl.replace('https://', '');
  const port = 6379; // Standard Redis port for Upstash
  
  return new IORedis({
    host: host,
    port: port,
    password: token,
    tls: {}, // Upstash requires TLS
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    lazyConnect: true,
  });
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await upstashRedis.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
} 