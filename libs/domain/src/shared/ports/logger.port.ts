// ./libs/domain/src/shared/ports/logger.port.ts
/**
 * @file Defines the port for logging abstraction.
 * @module @dfs-invest-flow/domain/shared/ports
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILoggerPort {
  debug(message: any, context?: string): void;
  error(message: any, trace?: string, context?: string): void;
  log(message: any, context?: string): void;
  setContext(context: string): void; // Método para establecer el contexto
  verbose?(message: any, context?: string): void;
  warn(message: any, context?: string): void;
}

/**
 * Injection token for the Logger Port.
 */
export const LOGGER_PORT = Symbol('ILoggerPort');
// ./libs/domain/src/shared/ports/logger.port.ts
