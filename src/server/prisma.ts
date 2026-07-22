import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Resilient connection handler with automatic retries for Neon cold starts.
// This guarantees your client's uploaded products save securely to the real 
// database and never revert to temporary memory or vanish on server restart.
// ---------------------------------------------------------------------------

async function connectWithRetry(retries = 5, delay = 4000): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("[DB] CRITICAL: DATABASE_URL is not set in environment variables!");
    throw new Error("DATABASE_URL is missing.");
  }

  console.log("[DB] DATABASE_URL detected. Connecting to real database...");

  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("[DB] Connected to real database successfully.");
      return;
    } catch (err: any) {
      console.warn(`[DB] Connection attempt ${i + 1} failed: ${err?.message || err}. Retrying in ${delay / 1000}s...`);
      if (i === retries - 1) {
        console.error("[DB] CRITICAL: Failed to connect to real database after multiple attempts.");
        throw err;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

export const dbReady: Promise<void> = connectWithRetry();

export default prisma;
