// ./libs/infrastructure/src/persistence/persistence.module.ts
import { Global, Module } from '@nestjs/common';

import { WHATSAPP_ACCOUNT_REPOSITORY_PORT } from '@dfs-invest-flow/domain';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaWhatsAppAccountRepositoryAdapter } from './prisma/repositories/prisma-whatsapp-account.repository.adapter';
// CORREGIDO: Eliminar import no usado de PrismaService
// import { PrismaService } from './prisma/prisma.service';

@Global() // Mantenemos Global para que PrismaService (provisto por PrismaModule) y el Repo estén disponibles
@Module({
  exports: [
    WHATSAPP_ACCOUNT_REPOSITORY_PORT, // Exportar el repositorio
    // No necesitamos exportar PrismaService si PrismaModule es Global
  ],
  imports: [PrismaModule], // PrismaModule provee y exporta PrismaService, y es Global
  providers: [
    {
      provide: WHATSAPP_ACCOUNT_REPOSITORY_PORT,
      useClass: PrismaWhatsAppAccountRepositoryAdapter,
    },
    // PrismaService es proveído globalmente por PrismaModule
  ],
})
export class PersistenceModule {}
// ./libs/infrastructure/src/persistence/persistence.module.ts
