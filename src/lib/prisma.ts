import {PrismaNeon} from '@prisma/adapter-neon';

import {PrismaClient} from '@/generated/prisma/client';

// Neon serverless driver over WebSockets (Pool-based: supports transactions).
// Node 22+/Vercel provide a global WebSocket, so no `ws` polyfill is needed.
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL ?? '',
});

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({adapter});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
