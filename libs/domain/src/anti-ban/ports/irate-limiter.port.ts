/**
 * @file Defines the port for interacting with the rate limiting mechanism.
 * @module @dfs-invest-flow/domain/anti-ban/ports
 */

/**
 * Interface defining the contract for consuming sending tokens based on rate limits.
 * Implementations handle the logic (e.g., Token Bucket, Fixed Window) usually backed by Redis.
 */
export interface IRateLimiterPort {
  /**
   * Attempts to consume a token (or multiple tokens based on cost) for a given account ID.
   * This operation should be atomic.
   * @param {string} accountId - The ID of the WhatsApp account (phone number ID).
   * @param {number} [cost=1] - Optional cost of the operation (e.g., certain message types might cost more tokens). Defaults to 1.
   * @returns {Promise<boolean>} True if a token was successfully consumed (meaning the action is allowed within the rate limit), false otherwise.
   */
  consumeToken(accountId: string, cost?: number): Promise<boolean>;

  // Consider adding methods like:
  // checkAllowance(accountId: string, cost?: number): Promise<boolean>; // Check without consuming
  // getCurrentLimit(accountId: string): Promise<{limit: number, remaining: number, reset: number}>; // Get current state
}

// Injection token
export const RATE_LIMITER_PORT = Symbol('IRateLimiterPort');
