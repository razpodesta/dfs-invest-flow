// ./libs/infrastructure/src/cache/cache.module.ts
import type { Provider } from '@nestjs/common';

import { Global, Module } from '@nestjs/common';

// Importar TODOS los tokens necesarios desde UN SOLO import
import { HEALTH_MONITOR_PORT, RATE_LIMITER_PORT } from '@dfs-invest-flow/domain';

import { RedisHealthTrackerAdapter } from './adapters/redis-health-tracker.adapter';
import { RedisRateLimiterAdapter } from './adapters/redis-rate-limiter.adapter';
import { REDIS_CLIENT, RedisProvider } from './providers/redis.provider';

const adapters: Provider[] = [RedisHealthTrackerAdapter, RedisRateLimiterAdapter];

const portMappings: Provider[] = [
  { provide: HEALTH_MONITOR_PORT, useExisting: RedisHealthTrackerAdapter },
  { provide: RATE_LIMITER_PORT, useExisting: RedisRateLimiterAdapter },
];

@Global()
@Module({
  exports: [REDIS_CLIENT, HEALTH_MONITOR_PORT, RATE_LIMITER_PORT],
  providers: [RedisProvider, ...adapters, ...portMappings],
})
export class CacheModule {}
// ./libs/infrastructure/src/cache/cache.module.ts
