import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prevent multiple PrismaClient instances in dev (hot reload) by caching
// on the global object.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.databaseUrl });
  return new PrismaClient({
    adapter,
    log: env.isProd ? ['error', 'warn'] : ['error', 'warn', 'query'],
  });
}

export const prisma = global.__prisma ?? createPrismaClient();

if (!env.isProd) {
  global.__prisma = prisma;
}
