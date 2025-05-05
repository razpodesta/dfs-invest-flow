// ./apps/api/src/webhooks/webhooks.module.ts
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule si no es global

import { WHATSAPP_WEBHOOK_QUEUE } from '@dfs-invest-flow/infrastructure'; // Usar la constante

import { WhatsappWebhookController } from './controllers/whatsapp-webhook.controller';
// Importar el futuro WhatsappWebhookProcessor cuando exista
// import { WhatsappWebhookProcessor } from './processors/whatsapp-webhook.processor';

@Module({
  controllers: [WhatsappWebhookController],
  // Importar BullModule.registerQueue aquí para poder inyectar la cola
  imports: [
    ConfigModule, // Asegurar que ConfigService esté disponible
    BullModule.registerQueue({ name: WHATSAPP_WEBHOOK_QUEUE }),
  ],
  providers: [
    // WhatsappWebhookProcessor, // Añadir cuando se implemente
  ],
})
export class WebhooksModule {}
// ./apps/api/src/webhooks/webhooks.module.ts
