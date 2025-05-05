// ./libs/domain/src/whatsapp/types/whatsapp-message-payload.type.ts
/**
 * @file Defines the type for WhatsApp message payloads.
 * @module @dfs-invest-flow/domain/whatsapp/types
 */

/**
 * Represents the data required to send a WhatsApp message.
 * Structure should align closely with the WhatsApp Cloud API payload,
 * but defined within our domain.
 * Example Placeholder Structure - Needs refinement based on actual API usage.
 */
export type TWhatsAppMessagePayload = {
  payload: {
    // Example structure, replace with actual possibilities
    messaging_product: 'whatsapp';
    template?: { components?: any[]; language: { code: string }; name: string };
    text?: { body: string; preview_url?: boolean };
    to: string;
    type: 'audio' | 'document' | 'image' | 'interactive' | 'template' | 'text';
    // ... other payload types ...
  };
  type: 'audio' | 'document' | 'image' | 'interactive' | 'template' | 'text';
};
// ./libs/domain/src/whatsapp/types/whatsapp-message-payload.type.ts
