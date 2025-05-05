// ./libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.integration-spec.ts
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { RedisContainer } = require('@testcontainers/redis');
import type { StartedTestContainer } from 'testcontainers';
import type RedisClient from 'ioredis';
import type { RedisRateLimiterAdapter as RedisRateLimiterAdapterType } from './redis-rate-limiter.adapter';

const Redis = require('ioredis');
const RedisRateLimiterAdapterImpl = require('./redis-rate-limiter.adapter').RedisRateLimiterAdapter;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('RedisRateLimiterAdapter (Integration)', () => {
  let redisContainer: StartedTestContainer | null = null;
  let redisClient: RedisClient | null = null;
  let rateLimiter: RedisRateLimiterAdapterType | null = null;

  // ... beforeAll y afterAll sin cambios ...
  beforeAll(async () => {
    try {
      console.log('Starting Redis container for RateLimiter...');
      redisContainer = await new RedisContainer().start();
      const redisHost: string = redisContainer!.getHost();
      const redisPort: number = redisContainer!.getMappedPort(6379);
      console.log(`Redis container started at ${redisHost}:${redisPort}`);
      redisClient = new Redis(redisPort, redisHost, {
        maxRetriesPerRequest: 5,
        connectTimeout: 5000,
      });

      console.log('Waiting for Redis client to be ready...');
      await new Promise<void>((resolve, reject) => {
        const readyTimeout = setTimeout(
          () => reject(new Error('Redis connection timed out')),
          6000,
        );
        redisClient!.on('ready', () => {
          clearTimeout(readyTimeout);
          console.log('Redis client emitted READY');
          resolve();
        });
        redisClient!.on('error', (err: Error) => {
          clearTimeout(readyTimeout);
          console.error('Redis client connection error:', err);
          reject(err);
        });
      });

      const adapterInstance = new RedisRateLimiterAdapterImpl(redisClient!);
      adapterInstance.onModuleInit();
      rateLimiter = adapterInstance;
      console.log('Redis client connected and RateLimiter initialized.');
    } catch (error) {
      console.error('Failed to start/connect Redis container:', error);
      if (redisClient) {
        await redisClient.quit().catch(() => {});
      }
      if (redisContainer)
        await redisContainer
          .stop()
          .catch((e: Error) => console.error('Error stopping container on setup failure', e));
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    console.log('Stopping Redis container for RateLimiter...');
    if (redisClient) {
      try {
        await redisClient.quit();
        console.log('Redis client quit successfully.');
      } catch (e) {
        console.error('Error quitting redis client', e);
        redisClient.disconnect(false);
      }
    }
    if (redisContainer) {
      try {
        await redisContainer.stop({ timeout: 5000 });
        console.log('Redis container stopped successfully.');
      } catch (e) {
        console.error('Error stopping redis container', e);
      }
    }
  });

  it('should be defined', () => {
    expect(rateLimiter).toBeDefined();
  });

  describe('consumeToken', () => {
    // ... tests sin cambios ...
    it('should return true if tokens are available', async () => {
      const accountId = 'rl-account-ok';
      const result: boolean = await rateLimiter!.consumeToken(accountId);
      expect(result).toBe(true);
    });

    it('should return false if rate limit is exceeded', async () => {
      const accountId = 'rl-account-exceed';
      for (let i = 0; i < 10; i++) {
        const consumeResult: boolean = await rateLimiter!.consumeToken(accountId);
        expect(consumeResult).toBe(true);
      }
      const result: boolean = await rateLimiter!.consumeToken(accountId);
      expect(result).toBe(false);
    });

    it('should allow consuming again after duration passes', async () => {
      const accountId = 'rl-account-wait';
      for (let i = 0; i < 10; i++) {
        await rateLimiter!.consumeToken(accountId);
      }
      let result = await rateLimiter!.consumeToken(accountId);
      expect(result).toBe(false);

      // Corregido: Aumentar espera a 3.1 segundos
      await sleep(3100);

      result = await rateLimiter!.consumeToken(accountId);
      expect(result).toBe(true);
    }, 5000);

    // ... tests sin cambios ...
    it('should consume multiple points if cost is specified', async () => {
      const accountId = 'rl-account-cost';
      let result: boolean = await rateLimiter!.consumeToken(accountId, 5);
      expect(result).toBe(true);
      result = await rateLimiter!.consumeToken(accountId, 5);
      expect(result).toBe(true);
      result = await rateLimiter!.consumeToken(accountId, 1);
      expect(result).toBe(false);
    });

    it('should return false for invalid cost (0, negative, NaN)', async () => {
      const accountId = 'rl-invalid-cost';
      let result: boolean = await rateLimiter!.consumeToken(accountId, 0);
      expect(result).toBe(false);
      result = await rateLimiter!.consumeToken(accountId, -1);
      expect(result).toBe(false);
      result = await rateLimiter!.consumeToken(accountId, NaN);
      expect(result).toBe(false);
    });

    it('should return false for empty accountId', async () => {
      const result: boolean = await rateLimiter!.consumeToken('');
      expect(result).toBe(false);
    });

    it('should handle concurrent requests reasonably (basic check)', async () => {
      const accountId = 'rl-concurrent';
      const promises: Promise<boolean>[] = [];
      for (let i = 0; i < 15; i++) {
        promises.push(rateLimiter!.consumeToken(accountId));
      }
      const results: boolean[] = await Promise.all(promises);
      const successes: number = results.filter((r) => r === true).length;
      expect(successes).toBeGreaterThanOrEqual(9);
      expect(successes).toBeLessThanOrEqual(11);
    }, 10000);
  });
});
// ./libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.integration-spec.ts
