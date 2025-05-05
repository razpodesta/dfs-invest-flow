// ./libs/domain/src/whatsapp/ports/whatsapp-message.port.ts
/**
 * @file Defines the port for sending messages via the WhatsApp infrastructure adapter.
 * @module @dfs-invest-flow/domain/whatsapp/ports
 */

// Corregido: Importar TWhatsAppMessagePayload desde types
import type { TWhatsAppMessagePayload } from '../types';

export interface IWhatsAppMessagePort {
  /**
   * Sends a message via the WhatsApp Cloud API infrastructure.
   * @param {string} recipientPhoneNumber - The E.164 phone number of the recipient.
   * @param {TWhatsAppMessagePayload} messageData - The message type and payload.
   * @param {string} accountIdToSendFrom - The specific WABA Phone Number ID to use for sending.
   * @param {number | string | undefined} [internalJobId] - Optional internal job ID for tracing.
   * @returns {Promise<TSendMessageResult>} Result indicating success/failure and message ID.
   */
  sendMessage(
    recipientPhoneNumber: string,
    messageData: TWhatsAppMessagePayload,
    accountIdToSendFrom: string,
    internalJobId?: number | string | undefined, // Añadido parámetro opcional
  ): Promise<TSendMessageResult>;
}

/**
 * Represents the result of a sendMessage attempt.
 */
export type TSendMessageResult = {
  /** Error details if the sending failed. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  /** Indicates if the message was successfully accepted by the API (or mock). */
  success: boolean;
  /** The unique message ID assigned by WhatsApp (or mock). */
  waMessageId?: string;
};

// Corregido: ELIMINAR la definición duplicada de TWhatsAppMessagePayload de aquí

// Injection Token
export const WHATSAPP_MESSAGE_PORT = Symbol('IWhatsAppMessagePort');
// ./libs/domain/src/whatsapp/ports/whatsapp-message.port.ts
