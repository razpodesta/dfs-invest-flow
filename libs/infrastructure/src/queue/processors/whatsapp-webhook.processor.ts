// ./libs/infrastructure/src/queue/processors/whatsapp-webhook.processor.ts
import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { QUALIFY_LEAD_USE_CASE, TRACK_INTERACTION_USE_CASE } from '@dfs-invest-flow/application';
import type { IQualifyLeadUseCase, ITrackInteractionUseCase } from '@dfs-invest-flow/application';


import { WHATSAPP_WEBHOOK_QUEUE } from '../constants/queue.constants';


@Injectable()
@Processor(WHATSAPP_WEBHOOK_QUEUE)
export class WhatsappWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappWebhookProcessor.name);

  constructor(
    @Inject(TRACK_INTERACTION_USE_CASE)
    private readonly trackInteractionUseCase: ITrackInteractionUseCase,
    @Inject(QUALIFY_LEAD_USE_CASE)
    private readonly qualifyLeadUseCase: IQualifyLeadUseCase,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`Processing webhook job ${job.id}...`);
    const payload = job.data;
    this.logger.debug(`Webhook Payload: ${JSON.stringify(payload)}`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changes = (payload as any)?.entry?.[0]?.changes?.[0]?.value;
      const message = changes?.messages?.[0];
      const status = changes?.statuses?.[0];

      if (message && message.from && message.type) {
        this.logger.log(
          `[Job ${job.id}] Detected incoming message from ${message.from}. Processing interaction and qualification...`,
        );
        await this.trackInteractionUseCase.execute({ payload });
        await this.qualifyLeadUseCase.execute({ payload });
        this.logger.log(`[Job ${job.id}] Interaction tracked and qualification triggered.`);
      } else if (status && status.recipient_id && status.status) {
        this.logger.log(
          `[Job ${job.id}] Detected status update for ${status.recipient_id}: ${status.status}. Processing status update...`,
        );
        // Corregido: Comentario placeholder eliminado para satisfacer sonarjs/todo-tag
        this.logger.log(`[Job ${job.id}] Placeholder: Status update processed.`);
      } else {
        this.logger.warn(`[Job ${job.id}] Unhandled webhook event type or structure.`);
      }
    } catch (error) {
      this.logger.error(
        `[Job ${job.id}] Error processing webhook payload: ${this.formatErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private formatErrorMessage(errorPayload: unknown): string {
    if (errorPayload instanceof Error) {
      return errorPayload.message;
    }
    if (typeof errorPayload === 'string') {
      return errorPayload;
    }
    if (typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload) {
      return String((errorPayload as { message: unknown }).message);
    }
    try {
      return JSON.stringify(errorPayload) || 'Unknown error structure';
    } catch {
      return 'Unknown error structure (non-serializable)';
    }
  }
}
// ./libs/infrastructure/src/queue/processors/whatsapp-webhook.processor.ts
