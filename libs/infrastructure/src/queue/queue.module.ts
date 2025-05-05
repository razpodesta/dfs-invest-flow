import type { Provider } from '@nestjs/common';
import type { QueueOptions } from 'bullmq';
// ./libs/infrastructure/src/queue/queue.module.ts
import type { RedisOptions } from 'ioredis';

import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// CORREGIDO: Eliminar import no usado de AntiBanDecisionService
// import { AntiBanDecisionService } from '@dfs-invest-flow/domain';
import { WhatsappCloudApiInfraModule } from '../whatsapp-cloud-api/whatsapp-cloud-api-infra.module';
import { WHATSAPP_OUTBOUND_QUEUE, WHATSAPP_WEBHOOK_QUEUE } from './constants/queue.constants';
import { WhatsappOutboundProcessor } from './processors/whatsapp-outbound.processor';
import { WhatsappWebhookProcessor } from './processors/whatsapp-webhook.processor';

const processors: Provider[] = [WhatsappOutboundProcessor, WhatsappWebhookProcessor];

@Global()
@Module({
  exports: [BullModule],
  imports: [
    ConfigModule,
    EventEmitterModule,
    WhatsappCloudApiInfraModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<QueueOptions> => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string | undefined>('REDIS_PASSWORD');
        const redisDb = configService.get<number | undefined>('REDIS_DB');

        const connectionOptions: RedisOptions = {
          host: redisHost,
          port: redisPort,
          ...(redisPassword && { password: redisPassword }),
          ...(redisDb !== undefined && { db: redisDb }),
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        };

        return {
          connection: connectionOptions,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              delay: 1000,
              type: 'exponential',
            },
            removeOnComplete: {
              age: 3600 * 24,
              count: 1000,
            },
            removeOnFail: {
              age: 3600 * 24 * 7,
              count: 5000,
            },
          },
        };
      },
    }),
    BullModule.registerQueue({ name: WHATSAPP_OUTBOUND_QUEUE }, { name: WHATSAPP_WEBHOOK_QUEUE }),
  ],
  // CORREGIDO: Eliminar AntiBanDecisionService de providers aquí
  providers: [...processors],
})
export class QueueModule {}
// ./libs/infrastructure/src/queue/queue.module.ts
