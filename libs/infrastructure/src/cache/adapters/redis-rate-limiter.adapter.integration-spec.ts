// ./libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.integration-spec.ts
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { RedisContainer } = require('@testcontainers/redis');
import type { StartedTestContainer } from 'testcontainers';
import type RedisClient from 'ioredis';
import type { RedisRateLimiterAdapter as RedisRateLimiterAdapterType } from './redis-rate-limiter.adapter';

const Redis = require('ioredis');
const RedisRateLimiterAdapterImpl = require('./redis-rate-limiter.adapter').RedisRateLimiterAdapter;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Aumentar timeout para hooks largos (incluyendo afterAll)
jest.setTimeout(15000); // 15 segundos

describe('RedisRateLimiterAdapter (Integration)', () => {
  let redisContainer: StartedTestContainer | null = null;
  let redisClient: RedisClient | null = null;
  let rateLimiter: RedisRateLimiterAdapterType | null = null;

  // ... beforeAll sin cambios ...
  beforeAll(async () => {
    try {
      console.log('[RateLimiter] Starting Redis container...');
      redisContainer = await new RedisContainer().start();
      const redisHost: string = redisContainer!.getHost();
      const redisPort: number = redisContainer!.getMappedPort(6379);
      console.log(`[RateLimiter] Redis container started at ${redisHost}:${redisPort}`);
      redisClient = new Redis(redisPort, redisHost, { maxRetriesPerRequest: 5, connectTimeout: 5000 });
      console.log('[RateLimiter] Waiting for Redis client connection...');
      await new Promise<void>((resolve, reject) => {
        const readyTimeout = setTimeout(() => reject(new Error('Redis connection timed out')), 10000);
        redisClient!.on('ready', () => { clearTimeout(readyTimeout); console.log('[RateLimiter] Redis client ready.'); resolve(); });
        redisClient!.on('error', (err: Error) => { clearTimeout(readyTimeout); console.error('[RateLimiter] Redis client connection error:', err); reject(err); });
      });
      const adapterInstance = new RedisRateLimiterAdapterImpl(redisClient!);
      adapterInstance.onModuleInit(); // Asegurarse que onModuleInit se llame explícitamente en test
      rateLimiter = adapterInstance;
      console.log('[RateLimiter] Redis client connected and RateLimiter initialized.');
    } catch (error) {
      console.error('[RateLimiter] Failed during setup:', error);
      if (redisClient) { await redisClient.quit().catch(() => {}); }
      if (redisContainer) { await redisContainer.stop().catch(() => {}); }
      throw error;
    }
  }, 60000);

  // CORREGIDO: Refactorizar afterAll
  afterAll(async () => {
    console.log('[RateLimiter] Starting teardown...');
    if (redisClient && redisClient.status === 'ready') {
      try {
        console.log('[RateLimiter] Quitting redis client...');
        await redisClient.quit(); // Esperar que el cliente cierre la conexión
        console.log('[RateLimiter] Redis client quit successfully.');
      } catch (e) {
        console.error('[RateLimiter] Error quitting redis client:', e);
        redisClient.disconnect(false); // Forzar desconexión si quit falla
      }
    } else if (redisClient) {
       console.warn('[RateLimiter] Redis client not ready, disconnecting forcefully.');
       redisClient.disconnect(false);
    }
    if (redisContainer) {
      try {
        console.log('[RateLimiter] Stopping redis container...');
        await redisContainer.stop({ timeout: 8000 }); // Dar tiempo al contenedor para parar
        console.log('[RateLimiter] Redis container stopped.');
      } catch (e) {
        console.error('[RateLimiter] Error stopping redis container:', e);
      }
    }
     console.log('[RateLimiter] Teardown complete.');
  });

  // ... tests sin cambios ...
  it('should be defined', () => { expect(rateLimiter).toBeDefined(); });
  // ... describe('consumeToken') ...
  describe('consumeToken', () => {
    it('should return true if tokens are available', async () => { /* ... */ const accountId = 'rl-account-ok'; const result: boolean = await rateLimiter!.consumeToken(accountId); expect(result).toBe(true); });
    it('should return false if rate limit is exceeded', async () => { /* ... */ const accountId = 'rl-account-exceed'; for (let i = 0; i < 10; i++) { const consumeResult: boolean = await rateLimiter!.consumeToken(accountId); expect(consumeResult).toBe(true); } const result: boolean = await rateLimiter!.consumeToken(accountId); expect(result).toBe(false); });
    it('should allow consuming again after duration passes', async () => { /* ... */ const accountId = 'rl-account-wait'; for (let i = 0; i < 10; i++) { await rateLimiter!.consumeToken(accountId); } let result = await rateLimiter!.consumeToken(accountId); expect(result).toBe(false); await sleep(3100); result = await rateLimiter!.consumeToken(accountId); expect(result).toBe(true); }, 5000); // Timeout del test individual
    it('should consume multiple points if cost is specified', async () => { /* ... */ const accountId = 'rl-account-cost'; let result: boolean = await rateLimiter!.consumeToken(accountId, 5); expect(result).toBe(true); result = await rateLimiter!.consumeToken(accountId, 5); expect(result).toBe(true); result = await rateLimiter!.consumeToken(accountId, 1); expect(result).toBe(false); });
    it('should return false for invalid cost (0, negative, NaN)', async () => { /* ... */ const accountId = 'rl-invalid-cost'; let result: boolean = await rateLimiter!.consumeToken(accountId, 0); expect(result).toBe(false); result = await rateLimiter!.consumeToken(accountId, -1); expect(result).toBe(false); result = await rateLimiter!.consumeToken(accountId, NaN); expect(result).toBe(false); });
    it('should return false for empty accountId', async () => { /* ... */ const result: boolean = await rateLimiter!.consumeToken(''); expect(result).toBe(false); });
    it('should handle concurrent requests reasonably (basic check)', async () => { /* ... */ const accountId = 'rl-concurrent'; const promises: Promise<boolean>[] = []; for (let i = 0; i < 15; i++) { promises.push(rateLimiter!.consumeToken(accountId)); } const results: boolean[] = await Promise.all(promises); const successes: number = results.filter((r) => r === true).length; expect(successes).toBeGreaterThanOrEqual(9); expect(successes).toBeLessThanOrEqual(11); }, 10000); // Timeout del test individual
  });
});
// ./libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.integration-spec.ts
