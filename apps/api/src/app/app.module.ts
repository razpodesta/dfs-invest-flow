import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { QUALIFY_LEAD_USE_CASE, TRACK_INTERACTION_USE_CASE } from '@dfs-invest-flow/application';
import {
  AntiBanInfraModule,
  CacheModule,
  ObservabilityModule,
  PersistenceModule,
  QueueModule,
  WhatsappCloudApiInfraModule,
} from '@dfs-invest-flow/infrastructure';

import { WebhooksModule } from '../webhooks/webhooks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  MockQualifyLeadUseCaseImpl,
  MockTrackInteractionUseCaseImpl,
} from './mocks/application.mocks';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    CacheModule,
    PersistenceModule,
    QueueModule,
    WhatsappCloudApiInfraModule,
    WebhooksModule,
    AntiBanInfraModule,
    ObservabilityModule,
  ],
  providers: [
    AppService,
    {
      provide: TRACK_INTERACTION_USE_CASE,
      useClass: MockTrackInteractionUseCaseImpl,
    },
    {
      provide: QUALIFY_LEAD_USE_CASE,
      useClass: MockQualifyLeadUseCaseImpl,
    },
  ],
})
export class AppModule {}
