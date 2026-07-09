import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn("WARNING: DATABASE_URL environment variable is not set. Database queries will fail until configured.");
    }
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

// Delegate all property accesses to the lazily initialized PrismaClient instance
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default prisma;
