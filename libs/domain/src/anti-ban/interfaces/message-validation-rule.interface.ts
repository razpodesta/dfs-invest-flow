/**
 * @file Defines the interface for rules used to validate message content or metadata before sending.
 * @module @dfs-invest-flow/domain/anti-ban/interfaces
 * @description Note: This interface is a placeholder for potential future content validation logic
 *              within the Anti-Ban system, likely post-MVP. It's defined now for architectural completeness.
 */

/**
 * Represents a rule for validating aspects of a message before it's sent.
 * Concrete implementations would check for spammy patterns, disallowed content, etc.
 */
export interface IMessageValidationRule {
  /**
   * A human-readable description of what the rule checks for.
   * @type {string}
   */
  description: string;

  /**
   * A unique identifier for the rule.
   * @type {string}
   */
  ruleId: string;

  /**
   * Validates the message data against the rule.
   *
   * @param {unknown} messageData - The message content or metadata to validate.
   *                                The exact type would depend on the specific rule.
   * @param {unknown} context - Optional context (e.g., lead profile, account status).
   * @returns {Promise<{isValid: boolean; violationReason?: string}>} A promise resolving to an object
   *         indicating if the message is valid according to this rule and an optional reason if invalid.
   */
  validate(
    messageData: unknown,
    context?: unknown,
  ): Promise<{ isValid: boolean; violationReason?: string }>;
}
