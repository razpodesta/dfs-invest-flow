// ./libs/infrastructure/src/whatsapp-cloud-api/adapters/whatsapp-official-api.adapter.ts
import type { ConfigService } from '@nestjs/config';
import type { EventEmitter2 } from '@nestjs/event-emitter';

import { Injectable, Logger } from '@nestjs/common';

import type {
  IWhatsAppMessagePort,
  TSendMessageResult,
  TWhatsAppMessagePayload,
} from '@dfs-invest-flow/domain';

import { MessageSentFailedEvent, MessageSentSuccessEvent } from '@dfs-invest-flow/domain';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class WhatsappOfficialApiAdapter implements IWhatsAppMessagePort {
  private readonly accessToken: string;
  private readonly apiVersion = 'v19.0';
  private readonly baseApiUrl = 'https://graph.facebook.com';
  private readonly logger = new Logger(WhatsappOfficialApiAdapter.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    if (!this.accessToken) {
      this.logger.error('WHATSAPP_ACCESS_TOKEN is not configured in environment variables!');
    } else {
      this.logger.log('WHATSAPP_ACCESS_TOKEN loaded successfully.');
    }
  }

  async sendMessage(
    recipientPhoneNumber: string,
    messageData: TWhatsAppMessagePayload,
    accountIdToSendFrom: string,
    internalJobId?: number | string | undefined,
  ): Promise<TSendMessageResult> {
    // ... (lógica sin cambios, ya tenía el ignore para pseudo-random) ...
    this.logger.log(
      `[MOCK ADAPTER] Attempting to send ${messageData.type} message to ${recipientPhoneNumber} from account ${accountIdToSendFrom} (Job: ${internalJobId ?? 'N/A'}) using Token: ${this.accessToken ? 'Loaded' : 'MISSING!'}`,
    );
    this.logger.debug(
      `[MOCK ADAPTER] URL Target (Conceptual): ${this.baseApiUrl}/${this.apiVersion}/${accountIdToSendFrom}/messages`,
    );
    this.logger.debug(`[MOCK ADAPTER] Payload: ${JSON.stringify(messageData.payload)}`);

    // eslint-disable-next-line sonarjs/pseudo-random
    await sleep(40 + Math.random() * 120);
    const simulateSuccess = true;

    if (simulateSuccess) {
      // eslint-disable-next-line sonarjs/pseudo-random
      const mockWamid = `wamid.mock.${Date.now()}.${Math.random().toString(36).substring(7)}`;
      this.logger.log(`[MOCK ADAPTER] Message sent successfully. WAMID: ${mockWamid}`);
      this.eventEmitter.emit(
        MessageSentSuccessEvent.eventName,
        new MessageSentSuccessEvent(
          internalJobId,
          accountIdToSendFrom,
          mockWamid,
          recipientPhoneNumber,
        ),
      );
      return { success: true, waMessageId: mockWamid };
    } else {
      // eslint-disable-next-line sonarjs/pseudo-random
      const fbTraceId = `mock_fbtrace_${Date.now()}${Math.random()}`;
      const mockErrorDetails = {
        code: 131048,
        error_subcode: 2534068,
        error_user_msg:
          'Não foi possível enviar a mensagem porque o limite de mensagens foi atingido. Tente novamente mais tarde.',
        error_user_title: 'Mensagem não enviada',
        fbtrace_id: fbTraceId,
        is_transient: false,
        message:
          '(MOCK)(#200) App does not have permission to send messages to this discovery phone number',
        type: 'OAuthException',
      };
      const mockResponseWithError = { error: mockErrorDetails };

      this.logger.warn(
        `[MOCK ADAPTER] Message sending failed for ${recipientPhoneNumber}. Error: ${mockErrorDetails.message}`,
      );

      this.eventEmitter.emit(
        MessageSentFailedEvent.eventName,
        new MessageSentFailedEvent(
          internalJobId,
          accountIdToSendFrom,
          recipientPhoneNumber,
          mockResponseWithError,
          messageData.type,
        ),
      );
      return { error: mockResponseWithError, success: false };
    }
  }
}
// ./libs/infrastructure/src/whatsapp-cloud-api/adapters/whatsapp-official-api.adapter.ts
