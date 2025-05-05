// ./tools/scripts/test-db-connection.ts
/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { config as configDotenv } from 'dotenv';
import path from 'path';

configDotenv({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env file.');
  process.exit(1);
}

// Corregido: Mover el eslint-disable a esta línea
// eslint-disable-next-line sonarjs/slow-regex
console.log(`Attempting to connect to: ${databaseUrl.replace(/:[^@]+@/, ':********@')}`); // El type guard de la línea 14 ya asegura que no es undefined aquí

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl, // Ya sabemos que no es undefined aquí
    },
  },
});

async function testConnection() {
  try {
    console.log('Connecting...');
    await prisma.$connect();
    console.log('✅ Connection successful! Performing a simple query...');

    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Simple query executed successfully:', result);

    const count = await prisma.whatsAppAccount.count();
    console.log(`✅ Found ${count} records in WhatsAppAccount table.`);
  } catch (error) {
    console.error('❌ Database Connection Failed!');
    if (error instanceof Error) {
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code?: unknown }).code
          : undefined;
      // Corregido: Usar type guard para databaseUrl aquí también
      const dbName = databaseUrl ? databaseUrl.split('/').pop()?.split('?')[0] : 'N/A';
      if (errorCode === 'P1003' || error.message.includes('does not exist')) {
        console.error(`Error: Database specified in DATABASE_URL ('${dbName}') does not exist.`);
        console.error(
          'Ensure the database is created or run migrations (`bunx prisma migrate dev`).',
        );
      } else {
        console.error('Error Code:', errorCode ?? 'N/A');
        console.error('Error Message:', error.message);
        console.error('---');
        console.error(
          'Possible Issues:\n' +
            '- Incorrect DATABASE_URL in .env file (User, Password, Host, Port, DB Name).\n' +
            '- Database server is not running or not accessible (Check Supabase status/Docker).\n' +
            '- Firewall blocking the connection to the database port.\n' +
            '- Supabase Network Restrictions (Check allowed IPs in Supabase settings if not using pooler).\n' +
            '- Incorrect Prisma schema or pending migrations (`bunx prisma migrate dev`).',
        );
      }
    } else {
      console.error('Unknown error structure:', error);
    }
    process.exitCode = 1;
  } finally {
    console.log('Disconnecting...');
    await prisma.$disconnect();
  }
}

testConnection();
// ./tools/scripts/test-db-connection.ts
