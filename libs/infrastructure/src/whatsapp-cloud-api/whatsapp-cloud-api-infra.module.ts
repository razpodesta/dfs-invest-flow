// ./libs/infrastructure/src/whatsapp-cloud-api/whatsapp-cloud-api-infra.module.ts
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common'; // Añadir Global si es necesario
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule

import { WHATSAPP_MESSAGE_PORT } from '@dfs-invest-flow/domain';

import { WhatsappOfficialApiAdapter } from './adapters/whatsapp-official-api.adapter';

@Global() // Hacer Global para facilitar inyección en otros módulos
@Module({
  exports: [WHATSAPP_MESSAGE_PORT], // Exportar el token
  // Importar ConfigModule para que ConfigService esté disponible
  imports: [
    ConfigModule,
    HttpModule.register({
      maxRedirects: 5,
      timeout: 5000, // Timeout para llamadas HTTP reales (cuando se implementen)
    }),
  ],
  providers: [
    {
      provide: WHATSAPP_MESSAGE_PORT,
      useClass: WhatsappOfficialApiAdapter,
    },
    // No es necesario proveer ConfigService aquí si ConfigModule es global y está importado
  ],
})
export class WhatsappCloudApiInfraModule {}
// ./libs/infrastructure/src/whatsapp-cloud-api/whatsapp-cloud-api-infra.module.ts
