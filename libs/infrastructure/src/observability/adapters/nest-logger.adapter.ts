import { Injectable, Logger, Scope } from '@nestjs/common';

// ./libs/infrastructure/src/observability/adapters/nest-logger.adapter.ts (Corregido any)
import type { ILoggerPort } from '@dfs-invest-flow/domain';

@Injectable({ scope: Scope.TRANSIENT })
export class NestLoggerAdapter implements ILoggerPort {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  // Corregido: Usar unknown en lugar de any
  debug(message: unknown, context?: string): void {
    if (context) this.logger.debug(message, context);
    else this.logger.debug(message);
  }

  // Corregido: Usar unknown en lugar de any
  error(message: unknown, trace?: string, context?: string): void {
    if (context) this.logger.error(message, trace, context);
    else this.logger.error(message, trace);
  }

  // Corregido: Usar unknown en lugar de any
  log(message: unknown, context?: string): void {
    if (context) this.logger.log(message, context);
    else this.logger.log(message);
  }

  setContext(context: string): void {
    this.logger = new Logger(context);
  }

  // Corregido: Usar unknown en lugar de any
  verbose(message: unknown, context?: string): void {
    if (context) this.logger.verbose(message, context);
    else this.logger.verbose(message);
  }

  // Corregido: Usar unknown en lugar de any
  warn(message: unknown, context?: string): void {
    if (context) this.logger.warn(message, context);
    else this.logger.warn(message);
  }
}
// ./libs/infrastructure/src/observability/adapters/nest-logger.adapter.ts
