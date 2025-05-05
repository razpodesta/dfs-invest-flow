/**
 * @file Defines the calculated risk level associated with sending a message from a specific account at a specific time.
 * @module @dfs-invest-flow/domain/anti-ban/enums
 */

/**
 * Represents the assessed risk level for a sending operation.
 * This is an internal assessment, potentially derived from Health Score,
 * Rate Limiter status, message type, etc.
 * Used by AntiBanDecisionService to determine the sending action.
 *
 * @enum {string}
 * @property {string} LOW - Sending is considered safe. High confidence.
 * @property {string} MEDIUM - Sending has moderate risk. Proceed with caution or use fallback account.
 * @property {string} HIGH - Sending is high risk. Should likely be queued or rejected.
 * @property {string} CRITICAL - Sending is critically risky (e.g., account RESTRICTED/BLOCKED). Reject sending.
 */
export enum ESendingRiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
}
