import type Redis from 'ioredis';

import { Inject, Injectable, Logger } from '@nestjs/common'; // Usando Logger temporal

// libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.ts
/**
 * @file Redis implementation for the Health Monitor Port.
 * @module @dfs-invest-flow/infrastructure/cache/adapters
 */
import type { IHealthMonitorPort } from '@dfs-invest-flow/domain'; // Ajusta ruta

import { REDIS_CLIENT } from '../providers/redis.provider';

// Prefix for Redis keys to avoid collisions
const HEALTH_SCORE_PREFIX = 'dfs:health:score:';
const DEFAULT_HEALTH_SCORE = 100;
const MIN_SCORE = 0;
const MAX_SCORE = 100;
// Optional: Expiration for scores if needed (e.g., scores decay if not updated)
// const SCORE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class RedisHealthTrackerAdapter implements IHealthMonitorPort {
  // Temporal: Usar ILoggerPort en el futuro (DT-ARC-001)
  private readonly logger = new Logger(RedisHealthTrackerAdapter.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async getScore(accountId: string): Promise<number> {
    const key = this.getKey(accountId);
    try {
      const scoreStr = await this.redis.get(key);
      if (scoreStr === null) {
        this.logger.log(
          `No health score found for ${accountId}, returning default ${DEFAULT_HEALTH_SCORE}`,
        );
        // Optionally set the default score here if it should persist
        // await this.redis.set(key, DEFAULT_HEALTH_SCORE, 'EX', SCORE_TTL_SECONDS);
        return DEFAULT_HEALTH_SCORE;
      }
      const score = parseInt(scoreStr, 10);
      return isNaN(score) ? DEFAULT_HEALTH_SCORE : score; // Return default if parsing fails
    } catch (error) {
      this.logger.error(
        `Failed to get score for ${accountId} from Redis`,
        error instanceof Error ? error.stack : error,
      );
      // Return default or throw depending on desired behavior on Redis error
      return DEFAULT_HEALTH_SCORE;
    }
  }

  async updateScore(accountId: string, delta: number): Promise<number> {
    const key = this.getKey(accountId);
    try {
      // Use INCRBY for atomic update
      const currentRawScore = await this.redis.incrby(key, delta);

      // Clamp the score between MIN_SCORE and MAX_SCORE
      let newScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, currentRawScore));

      // If clamping was needed, we need to SET the score back to the clamped value
      if (newScore !== currentRawScore) {
        await this.redis.set(key, newScore);
        // Optionally re-apply TTL if SET overwrites it
        // await this.redis.expire(key, SCORE_TTL_SECONDS);
      } else {
        // If no clamping, just ensure the key exists / optionally set TTL
        // const exists = await this.redis.exists(key);
        // if (!exists || TTL needed) { await this.redis.expire(key, SCORE_TTL_SECONDS); }
      }

      this.logger.log(`Updated score for ${accountId} by ${delta}. New score: ${newScore}`);
      return newScore;
    } catch (error) {
      this.logger.error(
        `Failed to update score for ${accountId} in Redis`,
        error instanceof Error ? error.stack : error,
      );
      // Decide how to handle update errors. Throwing might be appropriate.
      throw new Error(`Failed to update score for account ${accountId}`);
    }
  }

  private getKey(accountId: string): string {
    return `${HEALTH_SCORE_PREFIX}${accountId}`;
  }
}
// libs/infrastructure/src/cache/adapters/redis-health-tracker.adapter.ts
