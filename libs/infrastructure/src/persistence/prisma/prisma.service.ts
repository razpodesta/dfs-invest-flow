// ./libs/infrastructure/src/persistence/prisma/prisma.service.ts
import type { OnModuleInit } from '@nestjs/common'; // Usar import type

import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Importar el cliente instalado

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect(); // Ahora $connect debería ser reconocido
      this.logger.log('Prisma Client connected successfully.');
    } catch (error) {
      this.logger.error('Failed to connect Prisma Client', error);
    }
  }

  // Método enableShutdownHooks eliminado por no usarse
}
// ./libs/infrastructure/src/persistence/prisma/prisma.service.ts
