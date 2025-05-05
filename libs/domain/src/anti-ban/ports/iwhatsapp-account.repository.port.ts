import type { WhatsAppAccount } from '../entities/whatsapp-account.entity';
import type { EWhatsAppAccountStatus } from '../enums/whatsapp-account-status.enum';

export interface IWhatsAppAccountRepository {
  findById(id: string): Promise<null | WhatsAppAccount>;
  findByPhoneNumber(phoneNumber: string): Promise<null | WhatsAppAccount>;
  getAllActive(): Promise<WhatsAppAccount[]>;
  save(account: WhatsAppAccount): Promise<WhatsAppAccount>;
  updateHealthScoreAndStatus(
    accountId: string,
    healthScore: number,
    status: EWhatsAppAccountStatus,
  ): Promise<void>;
}

export const WHATSAPP_ACCOUNT_REPOSITORY_PORT = Symbol('IWhatsAppAccountRepository');
