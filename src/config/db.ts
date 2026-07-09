import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prevent multiple PrismaClient instances in dev (hot reload) by caching
// on the global object.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.isProd ? ['error', 'warn'] : ['error', 'warn', 'query'],
  });

if (!env.isProd) {
  global.__prisma = prisma;
}
