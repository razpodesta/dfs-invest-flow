// ./libs/infrastructure/src/whatsapp-cloud-api/whatsapp-cloud-api-infra.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WHATSAPP_MESSAGE_PORT } from '@dfs-invest-flow/domain';

import { WhatsappOfficialApiAdapter } from './adapters/whatsapp-official-api.adapter';

@Module({
  exports: [WHATSAPP_MESSAGE_PORT], // Exportar el token para que otros módulos lo inyecten
  // Asegurar que HttpModule esté importado si el adapter REAL lo usa
  imports: [
    HttpModule.register({
      maxRedirects: 5,
      timeout: 5000,
    }),
  ],
  providers: [
    {
      provide: WHATSAPP_MESSAGE_PORT, // Proveer usando el token del puerto
      useClass: WhatsappOfficialApiAdapter, // Usar la clase del adaptador (mock o real)
    },
    // No olvidar proveer ConfigService si el adaptador real lo necesita
  ],
})
export class WhatsappCloudApiInfraModule {}
// ./libs/infrastructure/src/whatsapp-cloud-api/whatsapp-cloud-api-infra.module.ts
