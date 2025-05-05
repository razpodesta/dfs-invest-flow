import { Global, Module } from '@nestjs/common';

import { LOGGER_PORT } from '@dfs-invest-flow/domain';

import { NestLoggerAdapter } from './adapters/nest-logger.adapter';

@Global()
@Module({
  exports: [LOGGER_PORT],
  providers: [
    {
      provide: LOGGER_PORT,
      useClass: NestLoggerAdapter,
    },
  ],
})
export class ObservabilityModule {}
