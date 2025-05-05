// ./libs/domain/src/anti-ban/services/anti-ban-decision.service.spec.ts
// No importar de @jest/globals

// Importar Valores (Clases/Enums)
const { AntiBanDecisionService } = require('./anti-ban-decision.service');
const { MIN_HEALTHY_SCORE_THRESHOLD } = require('../constants/anti-ban.constants');
const { WhatsAppAccount } = require('../entities/whatsapp-account.entity');
const { EWhatsAppAccountStatus } = require('../enums/whatsapp-account-status.enum');

// Importar Tipos (Interfaces/Tipos Alias/Tipos Enum)
import type { IRateLimiterPort, IWhatsAppAccountRepository } from '../ports';
import type { ILoggerPort } from '../../shared/ports';
import type { WhatsAppAccount as WhatsAppAccountType } from '../entities/whatsapp-account.entity';
// Corregido: Re-añadir import del TIPO Enum con alias
import type { EWhatsAppAccountStatus as EWhatsAppAccountStatusType } from '../enums/whatsapp-account-status.enum';
import { type AntiBanDecisionService as AntiBanDecisionServiceType } from './anti-ban-decision.service';

// Mocks simplificados
const mockAccountRepository = {
  getAllActive: jest.fn(),
  findById: jest.fn(),
  findByPhoneNumber: jest.fn(),
  save: jest.fn(),
  // Corregido: Usar el tipo importado EWhatsAppAccountStatusType
  updateHealthScoreAndStatus: jest.fn<
    Promise<void>,
    [string, number, EWhatsAppAccountStatusType]
  >(),
};
const mockRateLimiter = {
  consumeToken: jest.fn(),
};
const mockLogger = {
  debug: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  setContext: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn(),
};

// Usar tipo importado WhatsAppAccountType
const createMockAccount = (id: string, score: number, isActive = true): WhatsAppAccountType => {
  // ... (sin cambios en la implementación de createMockAccount) ...
  const account = new (WhatsAppAccount as any)({
    id,
    phoneNumber: `+1${id}000000`,
    isActive,
    status:
      score >= MIN_HEALTHY_SCORE_THRESHOLD
        ? EWhatsAppAccountStatus.HEALTHY
        : EWhatsAppAccountStatus.RESTRICTED,
    healthScore: score,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastHealthUpdateAt: new Date(),
  });
  return account;
};

describe('AntiBanDecisionService', () => {
  let service: AntiBanDecisionServiceType;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new AntiBanDecisionService(
      mockAccountRepository as IWhatsAppAccountRepository,
      mockRateLimiter as IRateLimiterPort,
      mockLogger as ILoggerPort,
    );
    (mockLogger as any).setContext(AntiBanDecisionService.name);
  });

  // --- Resto de los tests 'it' blocks SIN CAMBIOS ---
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should REJECT with NO_ACTIVE_ACCOUNTS if repository returns empty array', async () => {
    mockAccountRepository.getAllActive.mockResolvedValue([]);
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'REJECT', reason: 'NO_ACTIVE_ACCOUNTS' });
  });

  it('should REJECT with REPOSITORY_ERROR if repository throws error', async () => {
    const repoError = new Error('DB connection failed');
    mockAccountRepository.getAllActive.mockRejectedValue(repoError);
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'REJECT', reason: 'REPOSITORY_ERROR' });
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to retrieve active WhatsApp accounts',
      expect.any(String),
      AntiBanDecisionService.name,
    );
  });

  it('should REJECT with NO_HEALTHY_ACCOUNTS if all active accounts are below threshold', async () => {
    const unhealthy1 = createMockAccount('acc1', 10);
    const unhealthy2 = createMockAccount('acc2', MIN_HEALTHY_SCORE_THRESHOLD - 1);
    mockAccountRepository.getAllActive.mockResolvedValue([unhealthy1, unhealthy2]);
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'REJECT', reason: 'NO_HEALTHY_ACCOUNTS' });
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'No healthy WhatsApp accounts available.',
      AntiBanDecisionService.name,
    );
  });

  it('should SEND using the account with the highest score if token is available', async () => {
    const accLow = createMockAccount('accLow', 40);
    const accHigh = createMockAccount('accHigh', 95);
    const accMid = createMockAccount('accMid', 80);
    mockAccountRepository.getAllActive.mockResolvedValue([accLow, accHigh, accMid]);
    mockRateLimiter.consumeToken.mockResolvedValue(true);
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'SEND', accountId: 'accHigh' });
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('accHigh');
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('Token consumed successfully for account accHigh'),
      AntiBanDecisionService.name,
    );
  });

  it('should SEND using the second healthiest if the first is rate limited', async () => {
    const accLow = createMockAccount('accLow', 40);
    const accHigh = createMockAccount('accHigh', 95);
    const accMid = createMockAccount('accMid', 80);
    mockAccountRepository.getAllActive.mockResolvedValue([accLow, accHigh, accMid]);
    mockRateLimiter.consumeToken.mockImplementation(async (id: string) => id === 'accMid');
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'SEND', accountId: 'accMid' });
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('accHigh');
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('accMid');
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit exceeded for account accHigh'),
      AntiBanDecisionService.name,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('Token consumed successfully for account accMid'),
      AntiBanDecisionService.name,
    );
  });

  it('should SEND using the second healthiest if the first has rate limiter error', async () => {
    const accHigh = createMockAccount('accHigh', 95);
    const accMid = createMockAccount('accMid', 80);
    mockAccountRepository.getAllActive.mockResolvedValue([accHigh, accMid]);
    mockRateLimiter.consumeToken.mockImplementation(async (id: string) => {
      if (id === 'accHigh') throw new Error('Redis error');
      return true;
    });
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'SEND', accountId: 'accMid' });
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('accHigh');
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('accMid');
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error consuming token for account accHigh'),
      expect.any(String),
      AntiBanDecisionService.name,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('Token consumed successfully for account accMid'),
      AntiBanDecisionService.name,
    );
  });

  it('should QUEUE if all healthy accounts are rate limited', async () => {
    const acc1 = createMockAccount('acc1', 90);
    const acc2 = createMockAccount('acc2', 80);
    const acc3 = createMockAccount('acc3', 25);
    mockAccountRepository.getAllActive.mockResolvedValue([acc1, acc2, acc3]);
    mockRateLimiter.consumeToken.mockResolvedValue(false);
    const decision = await service.determineSendAction({});
    expect(decision).toEqual({ action: 'QUEUE', reason: 'RATE_LIMIT_ALL_ACCOUNTS' });
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('acc1');
    expect(mockRateLimiter.consumeToken).toHaveBeenCalledWith('acc2');
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit exceeded for account acc1'),
      AntiBanDecisionService.name,
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit exceeded for account acc2'),
      AntiBanDecisionService.name,
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'All healthy accounts are currently rate-limited. Decision: QUEUE',
      AntiBanDecisionService.name,
    );
  });
});
// ./libs/domain/src/anti-ban/services/anti-ban-decision.service.spec.ts
