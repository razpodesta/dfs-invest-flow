// ./libs/infrastructure/src/anti-ban/listeners/health-update.listener.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import type { IHealthMonitorPort, IWhatsAppAccountRepository } from '@dfs-invest-flow/domain';

import {
  EWhatsAppAccountStatus,
  HEALTH_MONITOR_PORT,
  MessageSentFailedEvent,
  MessageSentSuccessEvent,
  MIN_HEALTHY_SCORE_THRESHOLD, // <-- AÑADIDO: Importar constante
  WHATSAPP_ACCOUNT_REPOSITORY_PORT,
} from '@dfs-invest-flow/domain';

const SCORE_DELTA_SUCCESS = 1;
const SCORE_DELTA_FAILURE_TRANSIENT = -5;
const SCORE_DELTA_FAILURE_PERMANENT = -20;

@Injectable()
export class HealthUpdateListener {
  private readonly logger = new Logger(HealthUpdateListener.name);

  constructor(
    @Inject(HEALTH_MONITOR_PORT)
    private readonly healthMonitor: IHealthMonitorPort,
    @Inject(WHATSAPP_ACCOUNT_REPOSITORY_PORT)
    private readonly accountRepository: IWhatsAppAccountRepository,
  ) {}

  @OnEvent(MessageSentFailedEvent.eventName)
  async handleMessageSentFailed(event: MessageSentFailedEvent): Promise<void> {
    // ... (sin cambios en este método)
    if (event.accountId === 'N/A' || event.errorDetails?.message?.startsWith('Reject Reason:')) {
      this.logger.log(
        `Skipping health update for internal REJECT or N/A accountId (Job: ${event.internalJobId})`,
      );
      return;
    }
    this.logger.debug(`Handling MessageSentFailedEvent for account ${event.accountId}...`);
    let delta = SCORE_DELTA_FAILURE_TRANSIENT;
    const error = event.errorDetails?.error;
    if (error && typeof error === 'object') {
      if ('is_transient' in error && error.is_transient === false) {
        delta = SCORE_DELTA_FAILURE_PERMANENT;
        this.logger.warn(
          `Applying PERMANENT failure delta (${delta}) for account ${event.accountId} due to error: ${this.formatErrorMessage(error)}`,
        );
      } else {
        this.logger.warn(
          `Applying TRANSIENT failure delta (${delta}) for account ${event.accountId} due to error: ${this.formatErrorMessage(error)}`,
        );
      }
    } else {
      this.logger.warn(
        `Applying default TRANSIENT failure delta (${delta}) for account ${event.accountId} due to unknown error structure.`,
      );
    }
    try {
      const newScore = await this.healthMonitor.updateScore(event.accountId, delta);
      const newStatus = this.determineStatusFromScore(newScore);
      const currentAccount = await this.accountRepository.findById(event.accountId);
      if (currentAccount && currentAccount.status !== newStatus) {
        await this.accountRepository.updateHealthScoreAndStatus(
          event.accountId,
          newScore,
          newStatus,
        );
        this.logger.log(
          `Health score & status for account ${event.accountId} updated to ${newScore}, ${newStatus} after failure.`,
        );
      } else if (currentAccount) {
        this.logger.log(
          `Health score for account ${event.accountId} updated to ${newScore} after failure (status unchanged: ${newStatus}).`,
        );
      } else {
        this.logger.warn(`Account ${event.accountId} not found after failed send event.`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update health score after failure for account ${event.accountId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(MessageSentSuccessEvent.eventName)
  async handleMessageSentSuccess(event: MessageSentSuccessEvent): Promise<void> {
    // ... (sin cambios en este método)
    this.logger.debug(`Handling MessageSentSuccessEvent for account ${event.accountId}...`);
    try {
      const newScore = await this.healthMonitor.updateScore(event.accountId, SCORE_DELTA_SUCCESS);
      const newStatus = this.determineStatusFromScore(newScore);
      const currentAccount = await this.accountRepository.findById(event.accountId);
      if (currentAccount && currentAccount.status !== newStatus) {
        await this.accountRepository.updateHealthScoreAndStatus(
          event.accountId,
          newScore,
          newStatus,
        );
        this.logger.log(
          `Health score & status for account ${event.accountId} updated to ${newScore}, ${newStatus} after success.`,
        );
      } else if (currentAccount) {
        this.logger.log(
          `Health score for account ${event.accountId} updated to ${newScore} after success (status unchanged: ${newStatus}).`,
        );
      } else {
        this.logger.warn(`Account ${event.accountId} not found after successful send event.`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update health score after success for account ${event.accountId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private determineStatusFromScore(score: number): EWhatsAppAccountStatus {
    // CORREGIDO: Usar la constante importada
    if (score <= MIN_HEALTHY_SCORE_THRESHOLD) return EWhatsAppAccountStatus.RESTRICTED;
    if (score < 70) return EWhatsAppAccountStatus.WARN;
    return EWhatsAppAccountStatus.HEALTHY;
  }

  private formatErrorMessage(errorPayload: unknown): string {
    // ... (sin cambios)
    if (errorPayload instanceof Error) {
      return errorPayload.message;
    }
    if (typeof errorPayload === 'string') {
      return errorPayload;
    }
    if (typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload) {
      return String((errorPayload as { message: unknown }).message);
    }
    try {
      return JSON.stringify(errorPayload) || 'Unknown error structure';
    } catch {
      return 'Unknown error structure (non-serializable)';
    }
  }
}
// ./libs/infrastructure/src/anti-ban/listeners/health-update.listener.ts
