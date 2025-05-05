import type { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
// ./apps/api/src/webhooks/controllers/whatsapp-webhook.controller.ts
// CORREGIDO: Importar Request directamente de express
import type { Request } from 'express';

// CORREGIDO: Importar InjectQueue desde @nestjs/bullmq
import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { WHATSAPP_WEBHOOK_QUEUE } from '@dfs-invest-flow/infrastructure';

import { verifyWebhookSignature } from '../utils/whatsapp-security.utils';

// CORREGIDO: Definir interfaz local que extiende Request
interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly appSecret: string;
  private readonly hubVerifyToken: string;
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(WHATSAPP_WEBHOOK_QUEUE) private readonly webhookQueue: Queue,
  ) {
    this.hubVerifyToken = this.configService.get<string>('WHATSAPP_HUB_VERIFY_TOKEN', '');
    this.appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET', '');

    if (!this.hubVerifyToken || !this.appSecret) {
      this.logger.error('WHATSAPP_HUB_VERIFY_TOKEN or WHATSAPP_APP_SECRET not configured!');
    }
  }

  @HttpCode(200)
  @Post()
  // CORREGIDO: Usar la interfaz local RequestWithRawBody
  async handleWebhookEvent(
    @Req() req: RequestWithRawBody,
    @Body() payload: unknown,
    @Headers('x-hub-signature-256') signature: string,
  ): Promise<void> {
    // CORREGIDO: Acceder a req.rawBody usando la interfaz local
    if (!req.rawBody) {
      this.logger.error(
        'Missing rawBody from request. Ensure body-parser rawBody option is enabled in main.ts.',
      );
      return;
    }
    // CORREGIDO: Acceder a req.rawBody
    if (!signature || !verifyWebhookSignature(req.rawBody, this.appSecret, signature)) {
      this.logger.warn('Invalid webhook signature received.');
      return;
    }

    this.logger.log(`Received valid webhook event. Signature: ${signature}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    try {
      const jobId = `webhook-${Date.now()}`;
      await this.webhookQueue.add('processWebhook', payload, { jobId });
      this.logger.log(`Webhook payload enqueued successfully with Job ID: ${jobId}`);
    } catch (error) {
      this.logger.error(
        'Failed to add webhook payload to the queue',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    this.logger.log('Received webhook verification request');
    if (mode === 'subscribe' && token === this.hubVerifyToken) {
      this.logger.log('Webhook verification successful!');
      return challenge;
    } else {
      this.logger.warn('Webhook verification failed. Mode or token mismatch.');
      throw new UnauthorizedException('Webhook verification failed');
    }
  }
}
// ./apps/api/src/webhooks/controllers/whatsapp-webhook.controller.ts
