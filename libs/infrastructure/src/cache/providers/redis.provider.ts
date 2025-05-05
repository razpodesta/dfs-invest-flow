// libs/infrastructure/src/cache/providers/redis.provider.ts
import type { Provider } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

// Logger centralizado para Redis
const redisLogger = new Logger('RedisProvider');

/**
 * Opciones por defecto para el cliente Redis en caso de que no estén definidas
 * en variables de entorno.
 */
const DEFAULT_REDIS_CONFIG = {
  host: 'localhost',
  port: 6379,
  retryStrategy: (times: number) => {
    // Estrategia exponencial de reintento: 100ms, 200ms, 400ms, etc.
    // Máximo 30 segundos entre reintentos
    return Math.min(times * 100, 30000);
  },
};

/**
 * Función factory para crear y configurar un cliente Redis basado en
 * variables de entorno o valores por defecto.
 */
export const createRedisClient = (): Redis => {
  // Leer configuración de variables de entorno o usar valores por defecto
  const redisHost = process.env['REDIS_HOST'] || DEFAULT_REDIS_CONFIG.host;
  const redisPort = parseInt(process.env['REDIS_PORT'] || String(DEFAULT_REDIS_CONFIG.port), 10);
  const redisPassword = process.env['REDIS_PASSWORD'] || undefined;
  const redisDb = process.env['REDIS_DB'] ? parseInt(process.env['REDIS_DB'], 10) : undefined;

  // Crear cliente con opciones extendidas de reconexión
  const client = new Redis({
    db: redisDb,
    enableReadyCheck: true,
    host: redisHost,
    maxRetriesPerRequest: 3,
    password: redisPassword,
    port: redisPort,
    retryStrategy: DEFAULT_REDIS_CONFIG.retryStrategy,
  });

  // Usar logger centralizado para registrar eventos Redis
  // Nota: A futuro, se implementará un port de logging separado

  // Configurar event handlers
  client.on('error', (err) => {
    redisLogger.error(`Redis Client Error: ${err.message}`, err.stack);
  });

  client.on('connect', () => {
    redisLogger.log(`Redis client connected to ${redisHost}:${redisPort}`);
  });

  client.on('reconnecting', () => {
    redisLogger.warn('Redis client reconnecting...');
  });

  return client;
};

/**
 * Proveedor NestJS para el cliente Redis.
 * Utiliza factory pattern para permitir configuración dinámica.
 */
export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: createRedisClient,
};
// libs/infrastructure/src/cache/providers/redis.provider.ts
