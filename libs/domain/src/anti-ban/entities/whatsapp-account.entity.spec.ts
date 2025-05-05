// ./libs/domain/src/anti-ban/entities/whatsapp-account.entity.spec.ts (Corregido)
// Eliminada la línea: const { describe, it, expect } = require('@jest/globals');

// Importar la entidad a testear
const { WhatsAppAccount } = require('./whatsapp-account.entity');
const { EWhatsAppAccountStatus } = require('../enums/whatsapp-account-status.enum');

// Importar tipos necesarios
import type { WhatsAppAccount as WhatsAppAccountType } from './whatsapp-account.entity';

describe('WhatsAppAccount Entity', () => {
  const baseProps = {
    id: 'test-id-123',
    phoneNumber: '+15551234567',
  };

  it('should be defined', () => {
    const account: WhatsAppAccountType = WhatsAppAccount.create(baseProps);
    expect(account).toBeDefined();
  });

  it('should create an account with default healthy status and score', () => {
    const account: WhatsAppAccountType = WhatsAppAccount.create(baseProps);
    expect(account.id).toBe(baseProps.id);
    expect(account.phoneNumber).toBe(baseProps.phoneNumber);
    expect(account.status).toBe(EWhatsAppAccountStatus.HEALTHY);
    expect(account.healthScore).toBe(100);
    expect(account.isActive).toBe(true);
    expect(account.createdAt).toBeInstanceOf(Date);
    expect(account.updatedAt).toBeInstanceOf(Date);
    expect(account.lastHealthUpdateAt).toBeInstanceOf(Date);
  });

  it('should correctly determine if healthy for sending', () => {
    const healthyAccount: WhatsAppAccountType = WhatsAppAccount.create(baseProps);
    expect(healthyAccount.isHealthyForSending()).toBe(true);

    const blockedAccount: WhatsAppAccountType = WhatsAppAccount.create({
      ...baseProps,
      id: 'blocked-1',
    });
    blockedAccount.setStatus(EWhatsAppAccountStatus.BLOCKED);
    expect(blockedAccount.isHealthyForSending()).toBe(false);

    const restrictedAccount: WhatsAppAccountType = WhatsAppAccount.create({
      ...baseProps,
      id: 'restricted-1',
    });
    restrictedAccount.setStatus(EWhatsAppAccountStatus.RESTRICTED);
    expect(restrictedAccount.isHealthyForSending()).toBe(false);

    const inactiveAccount: WhatsAppAccountType = WhatsAppAccount.create({
      ...baseProps,
      id: 'inactive-1',
    });
    inactiveAccount.setActive(false);
    expect(inactiveAccount.isHealthyForSending()).toBe(false);
  });

  it('should update health score and status correctly', () => {
    const account: WhatsAppAccountType = WhatsAppAccount.create(baseProps);

    account.updateHealth(-40);
    expect(account.healthScore).toBe(60);
    expect(account.status).toBe(EWhatsAppAccountStatus.WARN);

    account.updateHealth(-40);
    expect(account.healthScore).toBe(20);
    expect(account.status).toBe(EWhatsAppAccountStatus.RESTRICTED);

    account.updateHealth(45);
    expect(account.healthScore).toBe(65);
    expect(account.status).toBe(EWhatsAppAccountStatus.WARN);

    account.updateHealth(10);
    expect(account.healthScore).toBe(75);
    expect(account.status).toBe(EWhatsAppAccountStatus.HEALTHY);

    account.updateHealth(50);
    expect(account.healthScore).toBe(100);
    expect(account.status).toBe(EWhatsAppAccountStatus.HEALTHY);

    account.healthScore = 10;
    account.status = EWhatsAppAccountStatus.WARN;
    account.updateHealth(-50);
    expect(account.healthScore).toBe(0);
    expect(account.status).toBe(EWhatsAppAccountStatus.RESTRICTED);
  });

  it('should update status based on quality rating override', () => {
    const account: WhatsAppAccountType = WhatsAppAccount.create(baseProps);

    account.updateHealth(0, 'YELLOW');
    expect(account.healthScore).toBe(100);
    expect(account.status).toBe(EWhatsAppAccountStatus.WARN);

    account.updateHealth(0, 'RED');
    expect(account.healthScore).toBe(100);
    expect(account.status).toBe(EWhatsAppAccountStatus.RESTRICTED);

    account.healthScore = 20;
    account.status = EWhatsAppAccountStatus.RESTRICTED;
    account.updateHealth(0, 'GREEN');
    expect(account.healthScore).toBe(20);
    expect(account.status).toBe(EWhatsAppAccountStatus.RESTRICTED);

    account.healthScore = 80;
    account.status = EWhatsAppAccountStatus.WARN;
    account.updateHealth(0, 'GREEN');
    expect(account.healthScore).toBe(80);
    expect(account.status).toBe(EWhatsAppAccountStatus.HEALTHY);
  });
});
// ./libs/domain/src/anti-ban/entities/whatsapp-account.entity.spec.ts
