// ./libs/domain/src/whatsapp/events/message-sent-status.event.ts
/**
 * @file Defines events related to message sending status.
 * @module @dfs-invest-flow/domain/whatsapp/events
 */

export class MessageSentFailedEvent {
  static readonly eventName = 'message.sent.failed';
  /**
   * Creates an instance of MessageSentFailedEvent.
   * @param internalJobId The ID of the internal queue job, if applicable.
   * @param accountId The ID of the WhatsApp account used or 'N/A'.
   * @param recipientPhoneNumber The recipient's phone number. (Argumento 3)
   * @param errorDetails The error object or reason for failure. (Argumento 4)
   * @param messageType The type of message that failed. (Argumento 5)
   */
  constructor(
    public readonly internalJobId: number | string | undefined, // Arg 1
    public readonly accountId: string, // Arg 2
    public readonly recipientPhoneNumber: string, // Arg 3
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly errorDetails: any, // Arg 4
    public readonly messageType: string, // Arg 5
  ) {}
}

export class MessageSentSuccessEvent {
  static readonly eventName = 'message.sent.success';
  /**
   * Creates an instance of MessageSentSuccessEvent.
   * @param internalJobId The ID of the internal queue job, if applicable.
   * @param accountId The ID of the WhatsApp account that sent the message.
   * @param waMessageId The message ID assigned by WhatsApp.
   * @param recipientPhoneNumber The recipient's phone number.
   */
  constructor(
    public readonly internalJobId: number | string | undefined, // Arg 1
    public readonly accountId: string, // Arg 2
    public readonly waMessageId: string, // Arg 3
    public readonly recipientPhoneNumber: string, // Arg 4
  ) {}
}
// ./libs/domain/src/whatsapp/events/message-sent-status.event.ts
