// ./libs/infrastructure/src/anti-ban/anti-ban-infra.module.ts
import { Module } from '@nestjs/common';

import type {
  ILoggerPort,
  IRateLimiterPort,
  IWhatsAppAccountRepository,
} from '@dfs-invest-flow/domain';

import {
  AntiBanDecisionService,
  LOGGER_PORT,
  RATE_LIMITER_PORT,
  WHATSAPP_ACCOUNT_REPOSITORY_PORT,
} from '@dfs-invest-flow/domain';

import { CacheModule } from '../cache/cache.module';
import { ObservabilityModule } from '../observability/observability.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { HealthUpdateListener } from './listeners/health-update.listener';

export const ANTI_BAN_DECISION_SERVICE = Symbol('AntiBanDecisionService');

@Module({
  exports: [ANTI_BAN_DECISION_SERVICE],
  imports: [CacheModule, PersistenceModule, ObservabilityModule],
  providers: [
    HealthUpdateListener,
    {
      inject: [WHATSAPP_ACCOUNT_REPOSITORY_PORT, RATE_LIMITER_PORT, LOGGER_PORT],
      provide: ANTI_BAN_DECISION_SERVICE,
      useFactory: (
        repo: IWhatsAppAccountRepository,
        limiter: IRateLimiterPort,
        loggerPort: ILoggerPort,
      ) => {
        return new AntiBanDecisionService(repo, limiter, loggerPort);
      },
    },
  ],
})
export class AntiBanInfraModule {}
// ./libs/infrastructure/src/anti-ban/anti-ban-infra.module.ts
