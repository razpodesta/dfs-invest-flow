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

// Simulación básica de sleep
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class WhatsappOfficialApiAdapter implements IWhatsAppMessagePort {
  private readonly accessToken: string;
  private readonly apiVersion: string;
  // APP_SECRET no se usa directamente aquí, pero su carga se valida en el constructor
  private readonly appSecretLoaded: boolean;
  private readonly baseApiUrl: string;
  private readonly logger = new Logger(WhatsappOfficialApiAdapter.name);

  constructor(
    // Inyectar EventEmitter2 y ConfigService
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    // Leer configuración esencial desde ConfigService
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v19.0'); // Usar versión de config o default
    this.baseApiUrl = 'https://graph.facebook.com'; // Podría venir de config también

    if (!this.accessToken) {
      this.logger.error('WHATSAPP_ACCESS_TOKEN is not configured!');
    } else {
      this.logger.log('WHATSAPP_ACCESS_TOKEN loaded.');
    }
    // Verificar carga de APP_SECRET aunque no se use aquí directamente
    this.appSecretLoaded = !!this.configService.get<string>('WHATSAPP_APP_SECRET');
    if (!this.appSecretLoaded) {
      this.logger.error('WHATSAPP_APP_SECRET is not configured!');
    } else {
      this.logger.log('WHATSAPP_APP_SECRET seems configured.');
    }
  }

  async sendMessage(
    recipientPhoneNumber: string,
    messageData: TWhatsAppMessagePayload,
    accountIdToSendFrom: string,
    internalJobId?: number | string | undefined,
  ): Promise<TSendMessageResult> {
    const logPrefix = `[MOCK][Job:${internalJobId ?? 'N/A'}][Acc:${accountIdToSendFrom}]`;
    this.logger.log(
      `${logPrefix} Sending ${messageData.type} to ${recipientPhoneNumber} using ${this.accessToken ? 'loaded token' : 'MISSING TOKEN!'}...`,
    );
    this.logger.debug(
      `${logPrefix} Target URL (Conceptual): ${this.baseApiUrl}/${this.apiVersion}/${accountIdToSendFrom}/messages`,
    );
    this.logger.debug(`${logPrefix} Payload: ${JSON.stringify(messageData.payload)}`);

    // Simular delay de red/API
    // eslint-disable-next-line sonarjs/pseudo-random
    await sleep(50 + Math.random() * 150);

    // Simular éxito o fallo (podría hacerse más complejo basado en input)
    // eslint-disable-next-line sonarjs/pseudo-random
    const simulateSuccess = Math.random() > 0.1; // Simular 10% de fallos

    if (simulateSuccess) {
      // eslint-disable-next-line sonarjs/pseudo-random
      const mockWamid = `wamid.mock.${Date.now()}.${Math.random().toString(36).substring(7)}`;
      this.logger.log(`${logPrefix} MOCK SUCCESS. WAMID: ${mockWamid}`);

      // Emitir evento de éxito
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
      // Simular un error específico (ej. Rate Limit)
      // eslint-disable-next-line sonarjs/pseudo-random
      const fbTraceId = `mock_fbtrace_${Date.now()}${Math.random()}`;
      const mockErrorDetails = {
        code: 131048, // Código común para rate limit o permiso
        error_subcode: 2534068, // Ejemplo
        error_user_msg: 'Limite de mensagens atingido. Tente novamente mais tarde.',
        error_user_title: 'Mensagem não enviada (Simulado)',
        fbtrace_id: fbTraceId,
        is_transient: true, // Simular error transitorio
        message: '(MOCK) Rate limit hit or permission issue simulation',
        type: 'OAuthException',
      };
      const mockResponseWithError = { error: mockErrorDetails };

      this.logger.warn(
        `${logPrefix} MOCK FAILURE for ${recipientPhoneNumber}. Error: ${mockErrorDetails.message}`,
      );

      // Emitir evento de fallo
      this.eventEmitter.emit(
        MessageSentFailedEvent.eventName,
        new MessageSentFailedEvent(
          internalJobId,
          accountIdToSendFrom,
          recipientPhoneNumber,
          mockResponseWithError, // Pasar el objeto error simulado
          messageData.type,
        ),
      );
      return { error: mockResponseWithError, success: false };
    }
  }
}
// ./libs/infrastructure/src/whatsapp-cloud-api/adapters/whatsapp-official-api.adapter.ts
