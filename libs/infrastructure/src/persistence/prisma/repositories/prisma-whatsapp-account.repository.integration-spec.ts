// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.integration-spec.ts
// Corregido: Reintroducir require de globales Jest
const { describe, it, expect, beforeAll, beforeEach, afterAll } = require('@jest/globals');
// Corregido: MANTENER import de tipo PrismaClient
import type { PrismaClient as PrismaClientType } from '@prisma/client';
const { PrismaClient } = require('@prisma/client');

import type { PrismaService } from '../prisma.service';
import type { PrismaWhatsAppAccountRepositoryAdapter } from './prisma-whatsapp-account.repository.adapter';
import type { WhatsAppAccount } from '@dfs-invest-flow/domain';
import { EWhatsAppAccountStatus } from '@dfs-invest-flow/domain';

const PrismaServiceImpl = require('../prisma.service').PrismaService;
const PrismaWhatsAppAccountRepositoryAdapterImpl =
  require('./prisma-whatsapp-account.repository.adapter').PrismaWhatsAppAccountRepositoryAdapter;
const WhatsAppAccountImpl = require('@dfs-invest-flow/domain').WhatsAppAccount;

describe('PrismaWhatsAppAccountRepositoryAdapter (Integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaWhatsAppAccountRepositoryAdapter;
  let rawClient: PrismaClientType;

  // ... resto del archivo SIN CAMBIOS LÓGICOS desde la versión anterior ...
  beforeAll(async () => {
    const databaseUrl = process.env['DATABASE_URL_TEST_INTEGRATION'] || process.env['DATABASE_URL'];
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST_INTEGRATION or DATABASE_URL is required for integration tests',
      );
    }
    rawClient = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    prisma = new PrismaServiceImpl();
    await prisma.$connect();
    await rawClient.$connect();
    repository = new PrismaWhatsAppAccountRepositoryAdapterImpl(prisma);
  }, 15000);

  beforeEach(async () => {
    await rawClient.whatsAppAccount.deleteMany({});
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await rawClient?.$disconnect();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save a new account', async () => {
    const account: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'test-save-id',
      phoneNumber: '+15550001111',
      displayName: 'Save Test Account',
    });
    const savedAccount = await repository.save(account);

    expect(savedAccount).toBeDefined();
    expect(savedAccount.id).toBe(account.id);
    expect(savedAccount.phoneNumber).toBe(account.phoneNumber);
    expect(savedAccount.healthScore).toBe(100);

    const found = await rawClient.whatsAppAccount.findUnique({ where: { id: 'test-save-id' } });
    expect(found).not.toBeNull();
    expect(found?.phoneNumber).toBe('+15550001111');
  });

  it('should update an existing account', async () => {
    const initialAccount: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'test-update-id',
      phoneNumber: '+15550002222',
    });
    await repository.save(initialAccount);

    initialAccount.displayName = 'Updated Name';
    initialAccount.setStatus(EWhatsAppAccountStatus.WARN);
    initialAccount.healthScore = 65;

    const updatedAccount = await repository.save(initialAccount);

    expect(updatedAccount.displayName).toBe('Updated Name');
    expect(updatedAccount.status).toBe(EWhatsAppAccountStatus.WARN);
    expect(updatedAccount.healthScore).toBe(65);

    const found = await rawClient.whatsAppAccount.findUnique({ where: { id: 'test-update-id' } });
    expect(found?.displayName).toBe('Updated Name');
    expect(found?.status).toBe(EWhatsAppAccountStatus.WARN);
  });

  it('should find an account by ID', async () => {
    const account: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'test-find-id',
      phoneNumber: '+15550003333',
    });
    await repository.save(account);

    const found = await repository.findById('test-find-id');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('test-find-id');
    expect(found).toBeInstanceOf(WhatsAppAccountImpl);
  });

  it('should return null if account not found by ID', async () => {
    const found = await repository.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('should find an account by phone number', async () => {
    const account: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'test-find-phone-id',
      phoneNumber: '+15550004444',
    });
    await repository.save(account);

    const found = await repository.findByPhoneNumber('+15550004444');
    expect(found).not.toBeNull();
    expect(found?.phoneNumber).toBe('+15550004444');
  });

  it('should get all active accounts', async () => {
    const acc1: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'active1',
      phoneNumber: '+111',
    });
    const acc2: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'active2',
      phoneNumber: '+222',
    });
    const accInactive: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'inactive1',
      phoneNumber: '+333',
    });
    accInactive.setActive(false);

    await repository.save(acc1);
    await repository.save(acc2);
    await repository.save(accInactive);

    const activeAccounts = await repository.getAllActive();
    expect(activeAccounts).toHaveLength(2);
    expect(activeAccounts.find((a: WhatsAppAccount) => a.id === 'active1')).toBeDefined();
    expect(activeAccounts.find((a: WhatsAppAccount) => a.id === 'active2')).toBeDefined();
    expect(activeAccounts.find((a: WhatsAppAccount) => a.id === 'inactive1')).toBeUndefined();
  });

  it('should update health score and status', async () => {
    const account: WhatsAppAccount = WhatsAppAccountImpl.create({
      id: 'test-health-update',
      phoneNumber: '+15550005555',
    });
    await repository.save(account);

    await repository.updateHealthScoreAndStatus(
      'test-health-update',
      30,
      EWhatsAppAccountStatus.RESTRICTED,
    );

    const found = await rawClient.whatsAppAccount.findUnique({
      where: { id: 'test-health-update' },
    });
    expect(found?.healthScore).toBe(30);
    expect(found?.status).toBe(EWhatsAppAccountStatus.RESTRICTED);
    expect(found?.lastHealthUpdateAt).not.toEqual(found?.createdAt);
  });

  it('should throw error when updating non-existent account health', async () => {
    await expect(
      repository.updateHealthScoreAndStatus('non-existent-health', 50, EWhatsAppAccountStatus.WARN),
    ).rejects.toThrow();
  });
});
// ./libs/infrastructure/src/persistence/prisma/repositories/prisma-whatsapp-account.repository.integration-spec.ts
