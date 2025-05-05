// ./apps/api/src/app/mocks/application.mocks.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';

// CORREGIDO: Importar interfaces como tipos
import type { IQualifyLeadUseCase, ITrackInteractionUseCase } from '@dfs-invest-flow/application';

const mockLogger = new Logger('MockUseCases');

@Injectable()
// CORREGIDO: Usar el tipo importado
export class MockTrackInteractionUseCaseImpl implements ITrackInteractionUseCase {
  async execute(input: { payload: any }): Promise<void> {
    mockLogger.log(
      `[MOCK] TrackInteractionUseCase called with payload: ${JSON.stringify(input.payload).substring(0, 100)}...`,
    );
    // No-op
  }
}

@Injectable()
// CORREGIDO: Usar el tipo importado
export class MockQualifyLeadUseCaseImpl implements IQualifyLeadUseCase {
  async execute(input: { payload: any }): Promise<void> {
    mockLogger.log(
      `[MOCK] QualifyLeadUseCase called with payload: ${JSON.stringify(input.payload).substring(0, 100)}...`,
    );
    // No-op
  }
}
// ./apps/api/src/app/mocks/application.mocks.ts
