import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Client Error: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Client Warning: ${e.message}`);
});

prisma.$on('info', (e) => {
  logger.info(`Prisma Client Info: ${e.message}`);
});
