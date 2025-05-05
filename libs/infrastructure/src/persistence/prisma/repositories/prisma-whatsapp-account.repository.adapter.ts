// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.adapter.ts
// CORREGIDO: Importar tipos Prisma necesarios para mapeo
import type { Prisma, WhatsAppAccount as PrismaWhatsAppAccount } from '@prisma/client';

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import type { EWhatsAppAccountStatus, IWhatsAppAccountRepository } from '@dfs-invest-flow/domain';

import { WhatsAppAccount } from '@dfs-invest-flow/domain'; // Importar clase de dominio

import type { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaWhatsAppAccountRepositoryAdapter implements IWhatsAppAccountRepository {
  private readonly logger = new Logger(PrismaWhatsAppAccountRepositoryAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<null | WhatsAppAccount> {
    this.logger.debug(`Finding WhatsAppAccount by id: ${id}`);
    try {
      const prismaAccount = await this.prisma.whatsAppAccount.findUnique({ where: { id } });
      // CORREGIDO: Llamar a mapToDomain
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
      // CORREGIDO: Llamar a mapToDomain
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
      // CORREGIDO: Llamar a mapToDomain
      return prismaAccounts.map(this.mapToDomain);
    } catch (error) {
      this.logger.error('Error getting all active WhatsAppAccounts', error);
      throw error;
    }
  }

  async save(account: WhatsAppAccount): Promise<WhatsAppAccount> {
    this.logger.log(`Saving WhatsAppAccount with id: ${account.id}`);
    try {
      // CORREGIDO: Llamar a métodos de mapeo
      const createData = this.mapToPrismaCreateData(account);
      const updateData = this.mapToPrismaUpdateData(account);

      const prismaAccount = await this.prisma.whatsAppAccount.upsert({
        create: createData,
        update: updateData,
        where: { id: account.id },
      });
      this.logger.log(`WhatsAppAccount ${account.id} saved successfully.`);
      // CORREGIDO: Llamar a mapToDomain
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
    this.logger.debug(
      `Updating health score (${healthScore}) and status (${status}) for account: ${accountId}`,
    );
    try {
      // El método update no necesita mapeo, actualiza directamente
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
      }
      this.logger.error(`Error updating health/status for account ${accountId}`, error);
      throw error;
    }
  }

  // --- CORREGIDO: Métodos de Mapeo Restaurados ---
  private mapToDomain(prismaAccount: PrismaWhatsAppAccount): WhatsAppAccount {
    // Re-crear instancia de dominio usando constructor privado (requiere hack 'any')
    // Es importante que las propiedades coincidan con el constructor de WhatsAppAccount
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
      status: prismaAccount.status as EWhatsAppAccountStatus, // Cast a Enum
      updatedAt: prismaAccount.updatedAt,
    });
    return domainAccount;
  }

  private mapToPrismaCreateData(domainAccount: WhatsAppAccount): Prisma.WhatsAppAccountCreateInput {
    // Mapear propiedades de la entidad de dominio a los campos de creación de Prisma
    return {
      displayName: domainAccount.displayName,
      healthScore: domainAccount.healthScore,
      id: domainAccount.id, // Usar CUID generado por dominio o dejar que Prisma genere? -> Usamos el del dominio
      isActive: domainAccount.isActive,
      messagingLimitTier: domainAccount.messagingLimitTier,
      phoneNumber: domainAccount.phoneNumber,
      qualityRatingTier: domainAccount.qualityRatingTier,
      status: domainAccount.status, // Prisma acepta el valor del Enum como string
      // createdAt, updatedAt, lastHealthUpdateAt usarán @default o @updatedAt
    };
  }

  private mapToPrismaUpdateData(domainAccount: WhatsAppAccount): Prisma.WhatsAppAccountUpdateInput {
    // Mapear propiedades actualizables
    return {
      displayName: domainAccount.displayName,
      healthScore: domainAccount.healthScore,
      isActive: domainAccount.isActive,
      lastHealthUpdateAt: domainAccount.lastHealthUpdateAt,
      messagingLimitTier: domainAccount.messagingLimitTier,
      qualityRatingTier: domainAccount.qualityRatingTier,
      status: domainAccount.status,
      // updatedAt se actualiza automáticamente con @updatedAt
    };
  }
}
// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.adapter.ts
