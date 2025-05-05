/**
 * @file Defines the port for interacting with the health monitoring system for WhatsApp accounts.
 * @module @dfs-invest-flow/domain/anti-ban/ports
 */

/**
 * Interface defining the contract for accessing and updating the health score
 * of WhatsApp accounts. Implementations typically use fast storage like Redis.
 */
export interface IHealthMonitorPort {
  /**
   * Retrieves the current health score for a specific account.
   * @param {string} accountId - The ID of the WhatsApp account (phone number ID).
   * @returns {Promise<number>} The current health score (e.g., 0-100). Returns a default healthy score (e.g., 100) if not found.
   */
  getScore(accountId: string): Promise<number>;

  /**
   * Updates the health score of an account by a given delta.
   * Implementations should handle atomic updates (e.g., INCRBY in Redis) and clamping (0-100).
   * @param {string} accountId - The ID of the WhatsApp account (phone number ID).
   * @param {number} delta - The amount to add to the score (can be negative).
   * @returns {Promise<number>} The new health score after the update.
   */
  updateScore(accountId: string, delta: number): Promise<number>;

  // Consider adding methods like:
  // setScore(accountId: string, score: number): Promise<void>; // To directly set a score (e.g., on block)
  // getScores(accountIds: string[]): Promise<Record<string, number>>; // For batch retrieval
}

// Injection token
export const HEALTH_MONITOR_PORT = Symbol('IHealthMonitorPort');
