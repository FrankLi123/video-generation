#!/usr/bin/env tsx

/**
 * Video Generation Worker
 * 
 * This script starts the background worker that processes video generation jobs
 * from the Redis queue using BullMQ.
 */

// Import will be done dynamically to avoid issues

async function startWorker() {
  console.log('🚀 Starting video generation worker...');
  
  // Import and initialize the worker
  const { testSimpleQueueConnection, simpleVideoWorker, getSimpleQueueStatus } = await import('../src/lib/queue/simple-video-queue');

  // Test Redis connection first
  const redisConnected = await testSimpleQueueConnection();
  if (!redisConnected) {
    console.error('❌ Redis connection failed. Make sure Redis is running.');
    process.exit(1);
  }
  
  console.log('✅ Worker initialized and ready to process jobs');
  
  // Log queue status every 30 seconds
  setInterval(async () => {
    try {
      const status = await getSimpleQueueStatus();
      console.log('📊 Queue Status:', status);
    } catch (error) {
      console.error('❌ Error getting queue status:', error);
    }
  }, 30000);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await simpleVideoWorker.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await simpleVideoWorker.close();
    process.exit(0);
  });

  console.log('🎬 Video generation worker is running. Press Ctrl+C to stop.');
}

// Start the worker
startWorker().catch((error) => {
  console.error('❌ Failed to start worker:', error);
  process.exit(1);
});
