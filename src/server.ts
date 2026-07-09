import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 FixItNow API running on port ${env.port} [${env.nodeEnv}]`);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
