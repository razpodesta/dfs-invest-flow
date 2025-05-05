/**
 * @file Defines the possible health/operational statuses for a WhatsApp Business Account number.
 * @module @dfs-invest-flow/domain/anti-ban/enums
 */

/**
 * Represents the operational status and health assessment of a WABA phone number.
 * Based on official WhatsApp Quality Rating tiers and potential internal states.
 */
export enum EWhatsAppAccountStatus {
  BLOCKED = 'BLOCKED',
  HEALTHY = 'HEALTHY',
  RESTRICTED = 'RESTRICTED',
  UNKNOWN = 'UNKNOWN',
  WARN = 'WARN',
}
