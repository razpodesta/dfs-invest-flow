// ./libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.integration-spec.ts
import type { StartedTestContainer } from 'testcontainers';
const { RedisContainer } = require('@testcontainers/redis');
import type RedisClient from 'ioredis';
import type { RedisHealthTrackerAdapter as RedisHealthTrackerAdapterType } from './redis-health-tracker.adapter';

const Redis = require('ioredis');
const RedisHealthTrackerAdapterImpl =
  require('./redis-health-tracker.adapter').RedisHealthTrackerAdapter;
const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

// Eliminada función retry

describe('RedisHealthTrackerAdapter (Integration)', () => {
  let redisContainer: StartedTestContainer | null = null;
  let redisClient: RedisClient | null = null;
  let healthMonitor: RedisHealthTrackerAdapterType | null = null;

  beforeAll(async () => {
    try {
      console.log('Starting Redis container for HealthTracker...');
      redisContainer = await new RedisContainer().start();
      const redisHost: string = redisContainer!.getHost();
      const redisPort: number = redisContainer!.getMappedPort(6379);
      console.log(`Redis container started at ${redisHost}:${redisPort}`);

      // Corregido: Crear cliente SIN lazyConnect y con retries razonables
      redisClient = new Redis(redisPort, redisHost, {
        maxRetriesPerRequest: 5, // Permitir algunos reintentos a ioredis
        connectTimeout: 5000, // Timeout de conexión
        // lazyConnect: false, // O simplemente omitir, default es false
      });

      // Esperar evento 'ready' o 'error'
      console.log('Waiting for Redis client to be ready...');
      await new Promise<void>((resolve, reject) => {
        const readyTimeout = setTimeout(
          () => reject(new Error('Redis connection timed out')),
          6000,
        ); // Aumentar timeout general
        redisClient!.on('ready', () => {
          clearTimeout(readyTimeout);
          console.log('Redis client emitted READY');
          resolve();
        });
        redisClient!.on('error', (err: Error) => {
          clearTimeout(readyTimeout);
          console.error('Redis client connection error:', err);
          reject(err); // Rechazar la promesa en caso de error de conexión
        });
      });

      healthMonitor = new RedisHealthTrackerAdapterImpl(redisClient!);
      console.log('Redis client connected successfully.');
    } catch (error) {
      console.error('Failed to start/connect Redis container:', error);
      // Asegurar limpieza incluso si la conexión falla
      if (redisClient) {
        await redisClient.quit().catch(() => {}); // Intentar quitar
      }
      if (redisContainer) {
        await redisContainer
          .stop()
          .catch((e: Error) => console.error('Error stopping container', e));
      }
      throw error; // Re-lanzar para que Jest falle el beforeAll
    }
  }, 60000);

  afterAll(async () => {
    console.log('Stopping Redis container for HealthTracker...');
    if (redisClient) {
      await redisClient.quit().catch((e: Error) => console.error('Error quitting redis client', e));
    }
    if (redisContainer) {
      await redisContainer
        .stop()
        .catch((e: Error) => console.error('Error stopping redis container', e));
    }
    console.log('Redis container stopped.');
  });

  beforeEach(async () => {
    // Corregido: Check más robusto antes de flush
    if (!redisClient || redisClient.status !== 'ready') {
      // Si el cliente no está listo aquí, beforeAll falló, los tests no deberían ejecutarse.
      // Lanzar error para detener la ejecución de tests individuales.
      throw new Error('Redis client is not connected in beforeEach. Setup failed.');
    }
    try {
      await redisClient.flushdb();
    } catch (err) {
      console.error('Error flushing DB in beforeEach:', err);
      // Considerar lanzar el error para detener tests si la limpieza es crucial
      // throw err;
    }
  });

  // ... resto de los tests sin cambios ...
  it('should be defined', () => {
    expect(healthMonitor).toBeDefined();
  });

  describe('getScore', () => {
    it('should return default score if key does not exist', async () => {
      const score: number = await healthMonitor!.getScore('nonexistent-account');
      expect(score).toBe(100);
    });

    it('should return stored score if key exists', async () => {
      await redisClient!.set('dfs:health:score:existing-account', '75');
      const score: number = await healthMonitor!.getScore('existing-account');
      expect(score).toBe(75);
    });

    it('should return default score if stored value is not a number', async () => {
      await redisClient!.set('dfs:health:score:invalid-score', 'not-a-number');
      const score: number = await healthMonitor!.getScore('invalid-score');
      expect(score).toBe(100);
    });
  });

  describe('updateScore', () => {
    it('should increment score correctly', async () => {
      await redisClient!.set('dfs:health:score:account-inc', '95');
      await healthMonitor!.updateScore('account-inc', 5);
      let score: number = await healthMonitor!.getScore('account-inc');
      expect(score).toBe(100);

      await redisClient!.set('dfs:health:score:account-inc', '80');
      await healthMonitor!.updateScore('account-inc', 15);
      score = await healthMonitor!.getScore('account-inc');
      expect(score).toBe(95);
    });

    it('should decrement score correctly', async () => {
      await redisClient!.set('dfs:health:score:account-dec', '100');
      await healthMonitor!.updateScore('account-dec', -20);
      const score: number = await healthMonitor!.getScore('account-dec');
      expect(score).toBe(80);
    });

    it('should clamp score at 100 when incrementing', async () => {
      await redisClient!.set('dfs:health:score:account-clamp-high', '98');
      const newScore: number = await healthMonitor!.updateScore('account-clamp-high', 10);
      expect(newScore).toBe(100);
      const storedScore: string | null = await redisClient!.get(
        'dfs:health:score:account-clamp-high',
      );
      expect(storedScore).toBe('100');
    });

    it('should clamp score at 0 when decrementing', async () => {
      await redisClient!.set('dfs:health:score:account-clamp-low', '5');
      const newScore: number = await healthMonitor!.updateScore('account-clamp-low', -10);
      expect(newScore).toBe(0);
      const storedScore: string | null = await redisClient!.get(
        'dfs:health:score:account-clamp-low',
      );
      expect(storedScore).toBe('0');
    });
  });
});
// ./libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.integration-spec.ts
