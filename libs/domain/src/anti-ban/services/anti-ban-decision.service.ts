import type { ILoggerPort } from '../../shared/ports';
import type { TWhatsAppMessagePayload } from '../../whatsapp/types';
import type { WhatsAppAccount } from '../entities/whatsapp-account.entity';
// ./libs/domain/src/anti-ban/services/anti-ban-decision.service.ts (Corregido)
// Importar SOLO las interfaces necesarias
import type { IRateLimiterPort, IWhatsAppAccountRepository } from '../ports';
import type { TAntiBanDecision } from '../types';

// NO importar los tokens aquí
import { MIN_HEALTHY_SCORE_THRESHOLD } from '../constants/anti-ban.constants';

// La clase y su lógica interna permanecen igual, pero sin referencias a los tokens importados
export class AntiBanDecisionService {
  private context = AntiBanDecisionService.name;

  constructor(
    private readonly accountRepository: IWhatsAppAccountRepository,
    private readonly rateLimiter: IRateLimiterPort,
    private readonly logger: ILoggerPort,
  ) {
    this.logger.setContext(this.context);
  }

  async determineSendAction(
    _messageData: Record<string, never> | TWhatsAppMessagePayload = {},
  ): Promise<TAntiBanDecision> {
    // ... lógica interna sin cambios ...
    let activeAccounts: WhatsAppAccount[] = [];

    try {
      activeAccounts = await this.accountRepository.getAllActive();
      if (activeAccounts.length === 0) {
        this.logger.warn('No active WhatsApp accounts found in repository.');
        return { action: 'REJECT', reason: 'NO_ACTIVE_ACCOUNTS' };
      }
      this.logger.debug(`Found ${activeAccounts.length} active accounts.`);
    } catch (error) {
      this.logger.error(
        'Failed to retrieve active WhatsApp accounts',
        error instanceof Error ? error.stack : undefined,
        this.context,
      );
      return { action: 'REJECT', reason: 'REPOSITORY_ERROR' };
    }

    const accountScores: Array<{ account: WhatsAppAccount; score: number }> = [];
    for (const account of activeAccounts) {
      const score = account.healthScore;
      if (score >= MIN_HEALTHY_SCORE_THRESHOLD) {
        accountScores.push({ account, score });
        this.logger.debug(
          `Account ${account.id} considered healthy (Score: ${score}).`,
          this.context,
        );
      } else {
        this.logger.debug(
          `Account ${account.id} skipped (Score: ${score} < ${MIN_HEALTHY_SCORE_THRESHOLD}).`,
          this.context,
        );
      }
    }

    if (accountScores.length === 0) {
      this.logger.warn('No healthy WhatsApp accounts available.', this.context);
      return { action: 'REJECT', reason: 'NO_HEALTHY_ACCOUNTS' };
    }

    accountScores.sort((a, b) => b.score - a.score);
    this.logger.debug(
      `Healthy accounts sorted by score: ${JSON.stringify(accountScores.map((a) => ({ id: a.account.id, score: a.score })))}`,
      this.context,
    );

    for (const { account } of accountScores) {
      try {
        this.logger.debug(`Attempting to consume token for account ${account.id}...`, this.context);
        const tokenAvailable = await this.rateLimiter.consumeToken(account.id);

        if (tokenAvailable) {
          this.logger.log(
            `Token consumed successfully for account ${account.id}. Decision: SEND`,
            this.context,
          );
          return { accountId: account.id, action: 'SEND' };
        } else {
          this.logger.warn(`Rate limit exceeded for account ${account.id}.`, this.context);
        }
      } catch (error) {
        this.logger.error(
          `Error consuming token for account ${account.id}. Skipping.`,
          error instanceof Error ? error.stack : undefined,
          this.context,
        );
      }
    }

    this.logger.warn(
      'All healthy accounts are currently rate-limited. Decision: QUEUE',
      this.context,
    );
    return { action: 'QUEUE', reason: 'RATE_LIMIT_ALL_ACCOUNTS' };
  }
}
// ./libs/domain/src/anti-ban/services/anti-ban-decision.service.ts
