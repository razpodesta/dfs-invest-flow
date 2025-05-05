// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.adapter.ts
import type { Prisma, WhatsAppAccount as PrismaWhatsAppAccount } from '@prisma/client';

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import type { EWhatsAppAccountStatus, IWhatsAppAccountRepository } from '@dfs-invest-flow/domain';

import { WhatsAppAccount } from '@dfs-invest-flow/domain';

import type { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaWhatsAppAccountRepositoryAdapter implements IWhatsAppAccountRepository {
  private readonly logger = new Logger(PrismaWhatsAppAccountRepositoryAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  // ... métodos findById, findByPhoneNumber, getAllActive, save sin cambios ...
  async findById(id: string): Promise<null | WhatsAppAccount> {
    this.logger.debug(`Finding WhatsAppAccount by id: ${id}`);
    try {
      const prismaAccount = await this.prisma.whatsAppAccount.findUnique({ where: { id } });
      return prismaAccount ? this.mapToDomain(prismaAccount) : null;
    } catch (error) {
      this.logger.error(`Error finding WhatsAppAccount by id ${id}`, error);
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<null | WhatsAppAccount> {
    this.logger.debug(`Finding WhatsAppAccount by phone number: ${phoneNumber}`);
    try {
      const prismaAccount = await this.prisma.whatsAppAccount.findUnique({
        where: { phoneNumber },
      });
      return prismaAccount ? this.mapToDomain(prismaAccount) : null;
    } catch (error) {
      this.logger.error(`Error finding WhatsAppAccount by phone ${phoneNumber}`, error);
      throw error;
    }
  }

  async getAllActive(): Promise<WhatsAppAccount[]> {
    this.logger.debug('Getting all active WhatsApp accounts...');
    try {
      const prismaAccounts = await this.prisma.whatsAppAccount.findMany({
        orderBy: { createdAt: 'asc' },
        where: { isActive: true },
      });
      this.logger.log(`Retrieved ${prismaAccounts.length} active accounts.`);
      return prismaAccounts.map(this.mapToDomain);
    } catch (error) {
      this.logger.error('Error getting all active WhatsAppAccounts', error);
      throw error;
    }
  }

  async save(account: WhatsAppAccount): Promise<WhatsAppAccount> {
    this.logger.log(`Saving WhatsAppAccount with id: ${account.id}`);
    try {
      const createData = this.mapToPrismaCreateData(account);
      const updateData = this.mapToPrismaUpdateData(account);

      const prismaAccount = await this.prisma.whatsAppAccount.upsert({
        create: createData,
        update: updateData,
        where: { id: account.id },
      });
      this.logger.log(`WhatsAppAccount ${account.id} saved successfully.`);
      return this.mapToDomain(prismaAccount);
    } catch (error) {
      this.logger.error(`Error saving WhatsAppAccount with id ${account.id}`, error);
      throw error;
    }
  }

  async updateHealthScoreAndStatus(
    accountId: string,
    healthScore: number,
    status: EWhatsAppAccountStatus,
  ): Promise<void> {
    // ... método sin cambios, la corrección P2025 ya estaba bien ...
    this.logger.debug(
      `Updating health score (${healthScore}) and status (${status}) for account: ${accountId}`,
    );
    try {
      await this.prisma.whatsAppAccount.update({
        data: {
          healthScore: Math.max(0, Math.min(100, healthScore)),
          lastHealthUpdateAt: new Date(),
          status: status as string,
          updatedAt: new Date(),
        },
        where: { id: accountId },
      });
      this.logger.log(`Successfully updated health/status for account ${accountId}`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(
          `Record to update not found for account ${accountId}. Error: ${error.message}`,
        );
        throw error;
      } else {
        this.logger.error(`Error updating health/status for account ${accountId}`, error);
        throw error;
      }
    }
  }

  private mapToDomain(prismaAccount: PrismaWhatsAppAccount): WhatsAppAccount {
    // CORREGIDO: Añadir disable-line para el warning 'any'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for domain entity instantiation with private constructor
    const domainAccount = new (WhatsAppAccount as any)({
      createdAt: prismaAccount.createdAt,
      displayName: prismaAccount.displayName,
      healthScore: prismaAccount.healthScore,
      id: prismaAccount.id,
      isActive: prismaAccount.isActive,
      lastHealthUpdateAt: prismaAccount.lastHealthUpdateAt,
      messagingLimitTier: prismaAccount.messagingLimitTier,
      phoneNumber: prismaAccount.phoneNumber,
      qualityRatingTier: prismaAccount.qualityRatingTier,
      status: prismaAccount.status as EWhatsAppAccountStatus,
      updatedAt: prismaAccount.updatedAt,
    });
    return domainAccount;
  }

  private mapToPrismaCreateData(domainAccount: WhatsAppAccount): Prisma.WhatsAppAccountCreateInput {
    // ... (sin cambios) ...
    return {
      displayName: domainAccount.displayName,
      healthScore: domainAccount.healthScore,
      id: domainAccount.id,
      isActive: domainAccount.isActive,
      messagingLimitTier: domainAccount.messagingLimitTier,
      phoneNumber: domainAccount.phoneNumber,
      qualityRatingTier: domainAccount.qualityRatingTier,
      status: domainAccount.status,
    };
  }

  private mapToPrismaUpdateData(domainAccount: WhatsAppAccount): Prisma.WhatsAppAccountUpdateInput {
    // ... (sin cambios) ...
    return {
      displayName: domainAccount.displayName,
      healthScore: domainAccount.healthScore,
      isActive: domainAccount.isActive,
      lastHealthUpdateAt: domainAccount.lastHealthUpdateAt,
      messagingLimitTier: domainAccount.messagingLimitTier,
      qualityRatingTier: domainAccount.qualityRatingTier,
      status: domainAccount.status,
    };
  }
}
// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.adapter.ts
