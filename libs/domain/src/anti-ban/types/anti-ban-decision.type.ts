/**
 * @file Defines the structure for the decision made by the Anti-Ban system regarding a message send attempt.
 * @module @dfs-invest-flow/domain/anti-ban/types
 */

/**
 * Represents the action to be taken for a message based on Anti-Ban rules.
 *
 * @type {{ action: 'SEND' | 'QUEUE' | 'REJECT'; accountId?: string; reason?: string }}
 * @property {'SEND' | 'QUEUE' | 'REJECT'} action - The determined action: SEND the message, QUEUE it for later retry, or REJECT it permanently.
 * @property {string} [accountId] - If action is 'SEND', the ID of the WhatsApp account (phone number ID) chosen for sending. Required for 'SEND'.
 * @property {string} [reason] - If action is 'QUEUE' or 'REJECT', an optional code or message explaining why (e.g., 'RATE_LIMIT_ALL_ACCOUNTS', 'NO_HEALTHY_ACCOUNTS', 'CONTENT_RISK_HIGH').
 */
export type TAntiBanDecision = {
  accountId?: string; // WABA Phone Number ID
  action: 'QUEUE' | 'REJECT' | 'SEND';
  reason?: string;
};
