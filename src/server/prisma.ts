import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// In-memory fallback database (used ONLY if the real Neon/Postgres database
// cannot be reached). This is a safety net, not the primary data source.
// ---------------------------------------------------------------------------
const memDb: any = {
  product: [
    {
      id: "prod_1",
      name: "THE TIKHI Traditional Homemade Aaloo Ka Achar - 250g",
      description: "A classic homemade Indian potato pickle made in small batches using traditional methods. Potatoes are slow-cooked and infused with a bold blend of whole spices and mustard oil for a spicy, tangy, savoury flavour. 100% vegetarian, with no artificial flavours or preservatives.",
      price: 398,
      originalPrice: 599,
      discount: 34,
      weight: "250g",
      ingredients: "Potato, Mustard Oil, Salt, Red Chilli Powder, Fennel Seeds, Dry Mango Powder, Tamarind, Green Chilli",
      stock: 100,
      status: "active",
      images: [],
      baseProductName: "Aaloo Ka Achar",
      variantType: "single",
      comboItems: null
    },
    {
      id: "prod_2",
      name: "THE TIKHI Traditional Homemade Aaloo Ka Achar - 500g",
      description: "A classic homemade Indian potato pickle made in small batches using traditional methods. Potatoes are slow-cooked and infused with a bold blend of whole spices and mustard oil for a spicy, tangy, savoury flavour. 100% vegetarian, with no artificial flavours or preservatives.",
      price: 499,
      originalPrice: 799,
      discount: 38,
      weight: "500g",
      ingredients: "Potato, Mustard Oil, Salt, Red Chilli Powder, Fennel Seeds, Dry Mango Powder, Tamarind, Green Chilli",
      stock: 100,
      status: "active",
      images: [],
      baseProductName: "Aaloo Ka Achar",
      variantType: "single",
      comboItems: null
    }
  ],
  user: [
    {
      id: "admin_1",
      email: process.env.ADMIN_EMAIL || "admin@thetikhi.com",
      name: "Admin",
      passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10),
      role: "admin"
    }
  ],
  order: [],
  coupon: [],
  review: [],
  passwordResetCode: [],
  siteSetting: []
};

function matchesWhere(item: any, where: any): boolean {
  if (!where) return true;
  return Object.keys(where).every((k) => {
    const condition = where[k];
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('equals' in condition) {
        const a = condition.equals;
        const b = item[k];
        if (condition.mode === 'insensitive' && typeof a === 'string' && typeof b === 'string') {
          return a.toLowerCase() === b.toLowerCase();
        }
        return a === b;
      }
      if ('path' in condition && 'equals' in condition) {
        // JSON path matching (used for order.customer->email / phone lookups)
        let val = item[k];
        for (const p of condition.path) {
          val = val ? val[p] : undefined;
        }
        return val === condition.equals;
      }
      return true;
    }
    return item[k] === condition;
  });
}

const createModelMock = (modelName: string) => {
  if (!memDb[modelName]) memDb[modelName] = [];

  return {
    findMany: async (query?: any) => {
      let result = [...memDb[modelName]];
      if (query?.where) {
        if (query.where.OR) {
          result = result.filter((item: any) => query.where.OR.some((cond: any) => matchesWhere(item, cond)));
        } else {
          result = result.filter((item: any) => matchesWhere(item, query.where));
        }
      }
      return result;
    },
    findUnique: async ({ where }: any) => memDb[modelName].find((item: any) => matchesWhere(item, where)) || null,
    findFirst: async ({ where }: any) => {
      if (!where) return memDb[modelName][0] || null;
      if (where.OR) {
        return memDb[modelName].find((item: any) => where.OR.some((cond: any) => matchesWhere(item, cond))) || null;
      }
      return memDb[modelName].find((item: any) => matchesWhere(item, where)) || null;
    },
    create: async ({ data }: any) => {
      const id = Math.random().toString(36).substring(7);
      const cleanData: any = { id };
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (val && typeof val === 'object' && 'create' in val) {
          // handle nested relation creates (e.g. items: { create: [...] }, statusHistory: { create: [...] })
          const nested = Array.isArray(val.create) ? val.create : [val.create];
          cleanData[key] = nested.map((n: any) => ({ id: Math.random().toString(36).substring(7), ...n }));
        } else {
          cleanData[key] = val;
        }
      }
      memDb[modelName].push(cleanData);
      return cleanData;
    },
    update: async ({ where, data }: any) => {
      const idx = memDb[modelName].findIndex((item: any) => matchesWhere(item, where));
      if (idx !== -1) {
        const current = memDb[modelName][idx];
        const merged: any = { ...current };
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (val && typeof val === 'object' && 'create' in val) {
            const nested = Array.isArray(val.create) ? val.create : [val.create];
            const additions = nested.map((n: any) => ({ id: Math.random().toString(36).substring(7), ...n }));
            merged[key] = [...(current[key] || []), ...additions];
          } else {
            merged[key] = val;
          }
        }
        memDb[modelName][idx] = merged;
        return merged;
      }
      throw new Error(`${modelName} not found`);
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      memDb[modelName].forEach((item: any, idx: number) => {
        if (matchesWhere(item, where)) {
          memDb[modelName][idx] = { ...item, ...data };
          count++;
        }
      });
      return { count };
    },
    upsert: async ({ where, update, create }: any) => {
      const idx = memDb[modelName].findIndex((item: any) => matchesWhere(item, where));
      if (idx !== -1) {
        memDb[modelName][idx] = { ...memDb[modelName][idx], ...update };
        return memDb[modelName][idx];
      }
      const id = Math.random().toString(36).substring(7);
      const newItem = { id, ...create };
      memDb[modelName].push(newItem);
      return newItem;
    },
    delete: async ({ where }: any) => {
      const idx = memDb[modelName].findIndex((item: any) => matchesWhere(item, where));
      if (idx !== -1) {
        return memDb[modelName].splice(idx, 1)[0];
      }
      throw new Error(`${modelName} not found`);
    },
    count: async () => memDb[modelName].length,
  };
};

const mockPrisma = new Proxy({} as any, {
  get: (target, prop: string) => {
    if (prop === '$connect' || prop === '$disconnect') return async () => {};
    if (prop === '$transaction') return async (args: any) => (Array.isArray(args) ? Promise.all(args) : args(mockPrisma));
    return createModelMock(prop);
  }
});

// ---------------------------------------------------------------------------
// Real database connection, with a timeout so a bad/slow DATABASE_URL fails
// fast and falls back to the mock above instead of hanging the whole server.
// ---------------------------------------------------------------------------

let prismaInstance: any = mockPrisma;

async function warmUpPrisma(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn("[DB] DATABASE_URL is not set. Using in-memory mock database.");
    prismaInstance = mockPrisma;
    return;
  }

  console.log("[DB] DATABASE_URL detected. Testing real database connection...");

  try {
    const client = new PrismaClient();
    await Promise.race([
      client.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out after 8 seconds")), 8000)
      )
    ]);
    prismaInstance = client;
    console.log("[DB] Connected to real database successfully.");
  } catch (err: any) {
    console.error(
      "[DB] Failed to connect to real database. Falling back to in-memory mock. Reason:",
      err?.message || err
    );
    prismaInstance = mockPrisma;
  }
}

// server.ts must `await dbReady` before app.listen() so the server knows
// definitively at boot time whether the real database is reachable.
export const dbReady: Promise<void> = warmUpPrisma();

const prisma = new Proxy({} as any, {
  get(target, prop, receiver) {
    const value = Reflect.get(prismaInstance, prop);
    if (typeof value === 'function') {
      return value.bind(prismaInstance);
    }
    return value;
  }
});

export default prisma;
