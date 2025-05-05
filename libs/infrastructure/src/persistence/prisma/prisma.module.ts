// ./libs/infrastructure/src/persistence/prisma/prisma.module.ts
// CORREGIDO: Añadir Global
import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global() // <-- Añadido decorador Global
@Module({
  exports: [PrismaService], // Exportar para inyección en otros módulos
  providers: [PrismaService],
})
export class PrismaModule {}
// ./libs/infrastructure/src/persistence/prisma/prisma.module.ts
