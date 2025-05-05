// ./libs/infrastructure/src/queue/processors/whatsapp-outbound.processor.ts (Corrección Imports y Any)
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';

// Corregido: Imports agrupados
import type {
  AntiBanDecisionService,
  IWhatsAppMessagePort,
  TAntiBanDecision,
  TSendMessageResult,
  TWhatsAppMessagePayload,
} from '@dfs-invest-flow/domain';

import {
  MessageSentFailedEvent,
  MessageSentSuccessEvent,
  WHATSAPP_MESSAGE_PORT,
} from '@dfs-invest-flow/domain';

import { ANTI_BAN_DECISION_SERVICE } from '../../anti-ban/anti-ban-infra.module';
import { WHATSAPP_OUTBOUND_QUEUE } from '../constants/queue.constants';

interface WhatsAppOutboundJobData {
  messageData: TWhatsAppMessagePayload;
  recipientPhoneNumber: string;
}

@Injectable()
@Processor(WHATSAPP_OUTBOUND_QUEUE)
export class WhatsappOutboundProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappOutboundProcessor.name);

  constructor(
    @Inject(ANTI_BAN_DECISION_SERVICE)
    private readonly antiBanDecisionService: AntiBanDecisionService,
    @Inject(WHATSAPP_MESSAGE_PORT)
    private readonly whatsAppMessagePort: IWhatsAppMessagePort,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<WhatsAppOutboundJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} from queue ${WHATSAPP_OUTBOUND_QUEUE}...`);
    const { messageData, recipientPhoneNumber } = job.data;
    let accountIdForEvent = 'N/A';
    let decision: null | TAntiBanDecision = null;

    try {
      decision = await this.antiBanDecisionService.determineSendAction(messageData);
      accountIdForEvent = decision.accountId || 'N/A';
      this.logger.debug(`[Job ${job.id}] Anti-Ban Decision: ${JSON.stringify(decision)}`);

      switch (decision.action) {
        case 'SEND': {
          // ... lógica send ...
          if (!decision.accountId) {
            throw new Error('Internal Error: Anti-Ban SEND decision missing accountId');
          }
          accountIdForEvent = decision.accountId;
          this.logger.log(`[Job ${job.id}] Action: SEND via account ${decision.accountId}`);
          const result: TSendMessageResult = await this.whatsAppMessagePort.sendMessage(
            recipientPhoneNumber,
            messageData,
            decision.accountId,
            job.id,
          );

          if (!result.success) {
            const errorMessage = this.formatErrorMessage(result.error);
            this.logger.error(`[Job ${job.id}] Failed to send message via port: ${errorMessage}`);
            this.eventEmitter.emit(
              MessageSentFailedEvent.eventName,
              new MessageSentFailedEvent(
                job.id,
                accountIdForEvent,
                recipientPhoneNumber,
                result.error, // Permitir 'any' aquí para el payload del evento
                messageData.type,
              ),
            );
            throw new Error(`WhatsApp Port sendMessage failed: ${errorMessage}`);
          }

          if (!result.waMessageId) {
            this.logger.error(`[Job ${job.id}] SEND success but missing waMessageId.`);
            this.eventEmitter.emit(
              MessageSentFailedEvent.eventName,
              new MessageSentFailedEvent(
                job.id,
                accountIdForEvent,
                recipientPhoneNumber,
                { message: 'Missing waMessageId on success' }, // Permitir 'any' aquí
                messageData.type,
              ),
            );
            throw new Error('Internal Error: SEND success but waMessageId is missing');
          }
          this.eventEmitter.emit(
            MessageSentSuccessEvent.eventName,
            new MessageSentSuccessEvent(
              job.id,
              accountIdForEvent,
              result.waMessageId,
              recipientPhoneNumber,
            ),
          );
          this.logger.log(
            `[Job ${job.id}] Message sent successfully via port (WAMID: ${result.waMessageId})`,
          );

          break;
        }
        case 'QUEUE': {
          // ... lógica queue ...
          this.logger.warn(
            `[Job ${job.id}] Action: QUEUE. Reason: ${decision.reason}. Job will be retried.`,
          );
          throw new Error(`Queueing job ${job.id} due to: ${decision.reason}`);
        }
        case 'REJECT': {
          // ... lógica reject ...
          this.logger.error(
            `[Job ${job.id}] Action: REJECT. Reason: ${decision.reason}. Job will fail permanently.`,
          );
          const rejectError = { message: `Reject Reason: ${decision.reason}` };
          this.eventEmitter.emit(
            MessageSentFailedEvent.eventName,
            new MessageSentFailedEvent(
              job.id,
              accountIdForEvent,
              recipientPhoneNumber,
              rejectError, // Permitir 'any' aquí
              messageData.type,
            ),
          );
          throw new Error(`Rejecting job ${job.id} due to: ${decision.reason}`);
        }
        default: {
          const exhaustiveCheck: never = decision.action;
          this.logger.error(`[Job ${job.id}] Unknown decision action: ${exhaustiveCheck}`);
          throw new Error(`Unknown Anti-Ban decision action: ${exhaustiveCheck}`);
        }
      }
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      if (!errorMessage.startsWith('Queueing job') && !errorMessage.startsWith('Rejecting job')) {
        this.logger.error(
          `[Job ${job.id}] Unhandled error processing job: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
        if (
          !errorMessage.startsWith('WhatsApp Port sendMessage failed') &&
          !errorMessage.includes('Missing waMessageId on success')
        ) {
          this.eventEmitter.emit(
            MessageSentFailedEvent.eventName,
            new MessageSentFailedEvent(
              job.id,
              accountIdForEvent,
              recipientPhoneNumber,
              error, // Permitir 'any' aquí
              messageData.type,
            ),
          );
        }
      }
      throw error;
    }
  }

  private formatErrorMessage(errorPayload: unknown): string {
    // ... sin cambios ...
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
// ./libs/infrastructure/src/queue/processors/whatsapp-outbound.processor.ts
