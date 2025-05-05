// ./libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.integration-spec.ts
import type { StartedTestContainer } from 'testcontainers';
const { RedisContainer } = require('@testcontainers/redis');
import type RedisClient from 'ioredis';
import type { RedisHealthTrackerAdapter as RedisHealthTrackerAdapterType } from './redis-health-tracker.adapter';

const Redis = require('ioredis');
const RedisHealthTrackerAdapterImpl =
  require('./redis-health-tracker.adapter').RedisHealthTrackerAdapter;
const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

// Aumentar timeout para hooks largos (incluyendo afterAll)
jest.setTimeout(15000); // 15 segundos

describe('RedisHealthTrackerAdapter (Integration)', () => {
  let redisContainer: StartedTestContainer | null = null;
  let redisClient: RedisClient | null = null;
  let healthMonitor: RedisHealthTrackerAdapterType | null = null;

  // ... beforeAll sin cambios ...
  beforeAll(async () => {
    try {
      console.log('[HealthTracker] Starting Redis container...');
      redisContainer = await new RedisContainer().start();
      const redisHost: string = redisContainer!.getHost();
      const redisPort: number = redisContainer!.getMappedPort(6379);
      console.log(`[HealthTracker] Redis container started at ${redisHost}:${redisPort}`);
      redisClient = new Redis(redisPort, redisHost, { maxRetriesPerRequest: 5, connectTimeout: 5000 });
      console.log('[HealthTracker] Waiting for Redis client connection...');
      await new Promise<void>((resolve, reject) => {
        const readyTimeout = setTimeout(() => reject(new Error('Redis connection timed out')), 10000); // Aumentar timeout conexión
        redisClient!.on('ready', () => { clearTimeout(readyTimeout); console.log('[HealthTracker] Redis client ready.'); resolve(); });
        redisClient!.on('error', (err: Error) => { clearTimeout(readyTimeout); console.error('[HealthTracker] Redis client connection error:', err); reject(err); });
      });
      healthMonitor = new RedisHealthTrackerAdapterImpl(redisClient!);
      console.log('[HealthTracker] Redis client connected.');
    } catch (error) {
      console.error('[HealthTracker] Failed during setup:', error);
      if (redisClient) { await redisClient.quit().catch(() => {}); }
      if (redisContainer) { await redisContainer.stop().catch(() => {}); }
      throw error;
    }
  }, 60000); // Mantener timeout largo para beforeAll

  // CORREGIDO: Refactorizar afterAll
  afterAll(async () => {
    console.log('[HealthTracker] Starting teardown...');
    if (redisClient && redisClient.status === 'ready') {
      try {
        console.log('[HealthTracker] Quitting redis client...');
        await redisClient.quit(); // Esperar que el cliente cierre la conexión
        console.log('[HealthTracker] Redis client quit successfully.');
      } catch (e) {
        console.error('[HealthTracker] Error quitting redis client:', e);
        redisClient.disconnect(false); // Forzar desconexión si quit falla
      }
    } else if (redisClient) {
       console.warn('[HealthTracker] Redis client not ready, disconnecting forcefully.');
       redisClient.disconnect(false);
    }
    if (redisContainer) {
      try {
        console.log('[HealthTracker] Stopping redis container...');
        await redisContainer.stop({ timeout: 8000 }); // Dar tiempo al contenedor para parar
        console.log('[HealthTracker] Redis container stopped.');
      } catch (e) {
        console.error('[HealthTracker] Error stopping redis container:', e);
      }
    }
    console.log('[HealthTracker] Teardown complete.');
  });


  // ... beforeEach y tests sin cambios ...
  beforeEach(async () => {
    if (!redisClient || redisClient.status !== 'ready') {
      throw new Error('Redis client is not connected in beforeEach. Setup failed.');
    }
    try {
      await redisClient.flushdb();
    } catch (err) {
      console.error('[HealthTracker] Error flushing DB in beforeEach:', err);
    }
  });

  it('should be defined', () => { expect(healthMonitor).toBeDefined(); });
  // ... describe('getScore') ...
  describe('getScore', () => {
    it('should return default score if key does not exist', async () => { /* ... */ const score: number = await healthMonitor!.getScore('nonexistent-account'); expect(score).toBe(100); });
    it('should return stored score if key exists', async () => { /* ... */ await redisClient!.set('dfs:health:score:existing-account', '75'); const score: number = await healthMonitor!.getScore('existing-account'); expect(score).toBe(75); });
    it('should return default score if stored value is not a number', async () => { /* ... */ await redisClient!.set('dfs:health:score:invalid-score', 'not-a-number'); const score: number = await healthMonitor!.getScore('invalid-score'); expect(score).toBe(100); });
  });
  // ... describe('updateScore') ...
  describe('updateScore', () => {
    it('should increment score correctly', async () => { /* ... */ await redisClient!.set('dfs:health:score:account-inc', '95'); await healthMonitor!.updateScore('account-inc', 5); let score: number = await healthMonitor!.getScore('account-inc'); expect(score).toBe(100); await redisClient!.set('dfs:health:score:account-inc', '80'); await healthMonitor!.updateScore('account-inc', 15); score = await healthMonitor!.getScore('account-inc'); expect(score).toBe(95); });
    it('should decrement score correctly', async () => { /* ... */ await redisClient!.set('dfs:health:score:account-dec', '100'); await healthMonitor!.updateScore('account-dec', -20); const score: number = await healthMonitor!.getScore('account-dec'); expect(score).toBe(80); });
    it('should clamp score at 100 when incrementing', async () => { /* ... */ await redisClient!.set('dfs:health:score:account-clamp-high', '98'); const newScore: number = await healthMonitor!.updateScore('account-clamp-high', 10); expect(newScore).toBe(100); const storedScore: string | null = await redisClient!.get('dfs:health:score:account-clamp-high'); expect(storedScore).toBe('100'); });
    it('should clamp score at 0 when decrementing', async () => { /* ... */ await redisClient!.set('dfs:health:score:account-clamp-low', '5'); const newScore: number = await healthMonitor!.updateScore('account-clamp-low', -10); expect(newScore).toBe(0); const storedScore: string | null = await redisClient!.get('dfs:health:score:account-clamp-low'); expect(storedScore).toBe('0'); });
  });
});
// ./libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.integration-spec.ts
