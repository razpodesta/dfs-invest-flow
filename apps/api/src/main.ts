// ./apps/api/src/main.ts
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'http';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  const configService = app.get(ConfigService);

  const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS', '');
  app.enableCors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: allowedOrigins ? allowedOrigins.split(',') : true,
  });
  Logger.log(`CORS enabled for origins: ${allowedOrigins || '*'}`, 'Bootstrap');

  app.enableShutdownHooks();
  Logger.log('Shutdown hooks enabled.', 'Bootstrap');

  app.useBodyParser('json', {
    limit: '5mb',
    verify: (req: { rawBody?: Buffer } & IncomingMessage, _res: ServerResponse, buf: Buffer) => {
      req.rawBody = buf;
      // Corregido: Eliminado código comentado
      // Logger.debug('Raw body preserved on request object.', 'RawBodyParser');
    },
  });
  Logger.log('JSON body parser configured to preserve rawBody.', 'Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );
  Logger.log('Global ValidationPipe applied.', 'Bootstrap');

  const globalPrefix = configService.get<string>('GLOBAL_PREFIX', 'api');
  app.setGlobalPrefix(globalPrefix);
  Logger.log(`Global prefix set to '/${globalPrefix}'.`, 'Bootstrap');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
  Logger.log(
    `✅ Environment: ${configService.get<string>('NODE_ENV', 'development')}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  Logger.error(`❌ Failed to bootstrap application: ${error}`, error.stack, 'Bootstrap');
  process.exit(1);
});
// ./apps/api/src/main.ts
