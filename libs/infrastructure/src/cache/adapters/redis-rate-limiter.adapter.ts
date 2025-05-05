// libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.ts
import type { OnModuleInit } from '@nestjs/common';
import type Redis from 'ioredis';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

import type { IRateLimiterPort } from '@dfs-invest-flow/domain';

import { REDIS_CLIENT } from '../providers/redis.provider';

// Configuración del rate limiter
const POINTS_PER_SECOND_DEFAULT = 10;
const DURATION_SECONDS = 1;
const RATE_LIMITER_KEY_PREFIX = 'dfs:rl:';

@Injectable()
export class RedisRateLimiterAdapter implements IRateLimiterPort, OnModuleInit {
  private readonly logger = new Logger(RedisRateLimiterAdapter.name);
  private rateLimiterInstance!: RateLimiterRedis;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async consumeToken(accountId: string, cost = 1): Promise<boolean> {
    if (!accountId) {
      this.logger.warn('Attempted to consume token with null or empty accountId');
      return false;
    }

    if (typeof cost !== 'number' || isNaN(cost) || cost <= 0) {
      this.logger.warn(`Invalid cost value provided for accountId ${accountId}: ${cost}`);
      return false;
    }

    if (!this.rateLimiterInstance) {
      this.logger.error('Rate limiter instance not initialized!');
      return false;
    }

    try {
      await this.rateLimiterInstance.consume(accountId, cost);
      return true;
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        this.logger.warn(
          `Rate limit exceeded for account ${accountId}. Blocked for ${error.msBeforeNext}ms`,
        );
        return false;
      }
      this.logger.error(
        `Unexpected error consuming rate limit token for ${accountId}`,
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }

  // Método adicional que podría ser útil para diagnóstico/monitoreo
  async getRemainingPoints(accountId: string): Promise<null | number> {
    if (!this.rateLimiterInstance) {
      this.logger.error('Rate limiter instance not initialized!');
      return null;
    }

    try {
      const res = await this.rateLimiterInstance.get(accountId);
      if (!res) {
        return POINTS_PER_SECOND_DEFAULT; // Máximo disponible si no hay registro
      }
      return Math.max(0, POINTS_PER_SECOND_DEFAULT - res.consumedPoints);
    } catch (error) {
      this.logger.error(
        `Failed to get remaining points for ${accountId}`,
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  onModuleInit(): void {
    try {
      this.rateLimiterInstance = new RateLimiterRedis({
        blockDuration: DURATION_SECONDS * 2,
        duration: DURATION_SECONDS,
        execEvenly: false,
        keyPrefix: RATE_LIMITER_KEY_PREFIX,
        points: POINTS_PER_SECOND_DEFAULT,
        storeClient: this.redis,
      });
      this.logger.log('RateLimiterRedis initialized successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to initialize RateLimiterRedis',
        error instanceof Error ? error.stack : error,
      );
      // Consideraría levantar una excepción fatal aquí ya que sin el rate limiter
      // el sistema podría no funcionar correctamente
      throw new Error(
        `Failed to initialize rate limiter: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
// libs/infrastructure/src/cache/adapters/redis-rate-limiter.adapter.ts
