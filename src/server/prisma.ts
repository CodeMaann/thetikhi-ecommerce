import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// In-memory data store for fallback
const users: any[] = [];
const products: any[] = [];
const orders: any[] = [];
const coupons: any[] = [];
const reviews: any[] = [];
const passwordResetCodes: any[] = [];

// Seed default products
products.push({
  id: "potato-pickle-250",
  name: "THE TIKHI Traditional Homemade Aaloo Ka Achar - 250g",
  description: "A classic homemade Indian potato pickle made in small batches using traditional methods. Potatoes are slow-cooked and infused with a bold blend of whole spices and mustard oil for a spicy, tangy, savoury flavour. 100% vegetarian, with no artificial flavours or preservatives.",
  price: 398,
  originalPrice: 599,
  discount: 34,
  weight: "250g",
  ingredients: "Potato, Mustard Oil, Salt, Red Chilli Powder, Fennel Seeds, Dry Mango Powder, Tamarind, Green Chilli",
  nutrition: "Energy: 180 kcal, Protein: 2g, Carbohydrate: 15g, Fat: 12g",
  stock: 100,
  status: "active",
  images: ["/achar image sample.jpeg"],
  baseProductName: "Aaloo Ka Achar"
});

products.push({
  id: "potato-pickle-500",
  name: "THE TIKHI Traditional Homemade Aaloo Ka Achar - 500g",
  description: "A classic homemade Indian potato pickle made in small batches using traditional methods. Potatoes are slow-cooked and infused with a bold blend of whole spices and mustard oil for a spicy, tangy, savoury flavour. 100% vegetarian, with no artificial flavours or preservatives.",
  price: 499,
  originalPrice: 799,
  discount: 38,
  weight: "500g",
  ingredients: "Potato, Mustard Oil, Salt, Red Chilli Powder, Fennel Seeds, Dry Mango Powder, Tamarind, Green Chilli",
  nutrition: "Energy: 180 kcal, Protein: 2g, Carbohydrate: 15g, Fat: 12g",
  stock: 100,
  status: "active",
  images: ["/achar image sample.jpeg"],
  baseProductName: "Aaloo Ka Achar"
});

// Seed default coupons
coupons.push({
  id: "coupon-1",
  code: "TIKHI10",
  type: "percentage",
  value: 10,
  active: true,
  expiresAt: null,
  minOrderValue: 299,
  usageLimit: 100,
  usedCount: 0
});
coupons.push({
  id: "coupon-2",
  code: "WELCOME20",
  type: "flat",
  value: 50,
  active: true,
  expiresAt: null,
  minOrderValue: 399,
  usageLimit: 100,
  usedCount: 0
});

// Seed admin user
const adminEmail = process.env.ADMIN_EMAIL || 'admin@thetikhi.com';
const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
const adminHash = bcrypt.hashSync(adminPass, 10);
users.push({
  id: "admin-user",
  email: adminEmail,
  name: "Admin User",
  passwordHash: adminHash,
  role: "admin",
  createdAt: new Date()
});

// Seed normal customer user
users.push({
  id: "customer-user",
  email: "customer@example.com",
  name: "John Doe",
  passwordHash: bcrypt.hashSync("password123", 10),
  role: "customer",
  createdAt: new Date()
});

// Create mock prisma client
const mockPrisma = {
  $connect: async () => {},
  $disconnect: async () => {},
  
  user: {
    findUnique: async ({ where }: any) => {
      if (where.email) {
        return users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      if (where.id) {
        return users.find(u => u.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const newUser = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        role: 'customer',
        ...data
      };
      users.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: any) => {
      let idx = -1;
      if (where.email) idx = users.findIndex(u => u.email.toLowerCase() === where.email.toLowerCase());
      else if (where.id) idx = users.findIndex(u => u.id === where.id);
      
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        return users[idx];
      }
      throw new Error("User not found");
    }
  },
  
  passwordResetCode: {
    create: async ({ data }: any) => {
      const newCode = {
        id: Math.random().toString(36).substring(7),
        used: false,
        createdAt: new Date(),
        ...data
      };
      passwordResetCodes.push(newCode);
      return newCode;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (const code of passwordResetCodes) {
        if (code.userId === where.userId && code.used === where.used) {
          code.used = data.used;
          count++;
        }
      }
      return { count };
    },
    findFirst: async ({ where }: any) => {
      return passwordResetCodes.find(c => c.code === where.code && c.userId === where.userId && c.used === where.used) || null;
    },
    update: async ({ where, data }: any) => {
      const idx = passwordResetCodes.findIndex(c => c.id === where.id);
      if (idx !== -1) {
        passwordResetCodes[idx] = { ...passwordResetCodes[idx], ...data };
        return passwordResetCodes[idx];
      }
      throw new Error("Code not found");
    }
  },

  product: {
    findMany: async (query?: any) => {
      let result = [...products];
      if (query?.where) {
        const where = query.where;
        if (where.status) {
          result = result.filter(p => p.status === where.status);
        }
        if (where.baseProductName) {
          result = result.filter(p => p.baseProductName === where.baseProductName);
        }
      }
      if (query?.orderBy) {
        result.sort((a, b) => {
          return a.weight.localeCompare(b.weight);
        });
      }
      return result;
    },
    findUnique: async ({ where }: any) => {
      return products.find(p => p.id === where.id) || null;
    },
    create: async ({ data }: any) => {
      const newProd = {
        id: Math.random().toString(36).substring(7),
        images: [],
        status: 'active',
        stock: 0,
        ...data
      };
      products.push(newProd);
      return newProd;
    },
    update: async ({ where, data }: any) => {
      const idx = products.findIndex(p => p.id === where.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...data };
        return products[idx];
      }
      throw new Error("Product not found");
    },
    delete: async ({ where }: any) => {
      const idx = products.findIndex(p => p.id === where.id);
      if (idx !== -1) {
        const deleted = products[idx];
        products.splice(idx, 1);
        return deleted;
      }
      throw new Error("Product not found");
    }
  },

  coupon: {
    findFirst: async ({ where }: any) => {
      if (where?.code) {
        const searchCode = typeof where.code === 'string' 
          ? where.code 
          : (where.code.equals || '');
        return coupons.find(c => c.code.toLowerCase() === searchCode.toLowerCase()) || null;
      }
      return null;
    },
    findMany: async () => {
      return coupons;
    },
    create: async ({ data }: any) => {
      const newCoupon = {
        id: Math.random().toString(36).substring(7),
        active: true,
        usedCount: 0,
        ...data
      };
      coupons.push(newCoupon);
      return newCoupon;
    },
    update: async ({ where, data }: any) => {
      const idx = coupons.findIndex(c => c.id === where.id);
      if (idx !== -1) {
        coupons[idx] = { ...coupons[idx], ...data };
        return coupons[idx];
      }
      throw new Error("Coupon not found");
    },
    delete: async ({ where }: any) => {
      const idx = coupons.findIndex(c => c.id === where.id);
      if (idx !== -1) {
        const deleted = coupons[idx];
        coupons.splice(idx, 1);
        return deleted;
      }
      throw new Error("Coupon not found");
    }
  },

  order: {
    create: async ({ data }: any) => {
      const { items, statusHistory, ...rest } = data;
      const orderId = rest.orderId || 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const internalId = Math.random().toString(36).substring(7);
      
      const createdItems = (items?.create || []).map((item: any) => ({
        id: Math.random().toString(36).substring(7),
        orderId: internalId,
        ...item
      }));
      
      const createdStatusHistory = (statusHistory?.create || []).map((h: any) => ({
        id: Math.random().toString(36).substring(7),
        orderId: internalId,
        timestamp: new Date().toISOString(),
        ...h
      }));

      const newOrder = {
        id: internalId,
        orderId,
        orderDate: rest.orderDate || new Date().toISOString(),
        customer: rest.customer || {},
        pricing: rest.pricing || {},
        payment: rest.payment || {},
        status: rest.status || 'Received',
        estimatedDelivery: rest.estimatedDelivery || '',
        receiptUrl: rest.receiptUrl || `/receipt/${orderId}`,
        tracking: rest.tracking || null,
        items: createdItems,
        statusHistory: createdStatusHistory
      };

      orders.push(newOrder);

      // Decrease stock for products
      for (const item of createdItems) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }

      // If coupon was used, increment usage count
      if (rest.pricing?.couponCode) {
        const coupon = coupons.find(c => c.code.toLowerCase() === rest.pricing.couponCode.toLowerCase());
        if (coupon) {
          coupon.usedCount++;
        }
      }

      return newOrder;
    },
    findMany: async (query?: any) => {
      let result = [...orders];
      if (query?.where) {
        const where = query.where;
        if (where.customer && where.customer.path && where.customer.path.includes('phone')) {
          const searchPhone = where.customer.equals.trim();
          result = result.filter(o => o.customer && o.customer.phone === searchPhone);
        }
      }
      if (query?.orderBy) {
        result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      }
      return result;
    },
    findUnique: async ({ where }: any) => {
      if (where.id) {
        return orders.find(o => o.id === where.id) || null;
      }
      if (where.orderId) {
        return orders.find(o => o.orderId === where.orderId) || null;
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      if (where?.customer?.path?.includes('email')) {
        const email = where.customer.equals;
        const productId = where?.items?.some?.productId;
        return orders.find(o => {
          const emailMatch = o.customer && o.customer.email === email;
          const productMatch = !productId || o.items.some((item: any) => item.productId === productId);
          return emailMatch && productMatch;
        }) || null;
      }
      return null;
    },
    update: async ({ where, data }: any) => {
      const order = orders.find(o => o.id === where.id || o.orderId === where.orderId);
      if (!order) throw new Error("Order not found");

      if (data.status) {
        order.status = data.status;
      }
      if (data.tracking) {
        order.tracking = data.tracking;
      }
      if (data.statusHistory?.create) {
        const list = Array.isArray(data.statusHistory.create) 
          ? data.statusHistory.create 
          : [data.statusHistory.create];
        for (const h of list) {
          order.statusHistory.push({
            id: Math.random().toString(36).substring(7),
            orderId: order.id,
            timestamp: new Date().toISOString(),
            ...h
          });
        }
      }
      return order;
    }
  },

  review: {
    findMany: async (query?: any) => {
      let result = [...reviews];
      if (query?.where?.productId) {
        result = result.filter(r => r.productId === query.where.productId);
      }
      result = result.map(r => {
        const userObj = users.find(u => u.id === r.userId);
        return {
          ...r,
          user: {
            name: userObj ? userObj.name : "Anonymous"
          }
        };
      });
      if (query?.orderBy) {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return result;
    },
    create: async ({ data }: any) => {
      const newReview = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        ...data
      };
      reviews.push(newReview);
      
      const userObj = users.find(u => u.id === data.userId);
      return {
        ...newReview,
        user: {
          name: userObj ? userObj.name : "Anonymous"
        }
      };
    }
  }
};

let prismaInstance: any = null;

function getPrisma(): any {
  if (!prismaInstance) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.log("[AI Studio] DATABASE_URL detected. Initializing real Prisma Client...");
      try {
        prismaInstance = new PrismaClient();
      } catch (err) {
        console.error("[AI Studio] Failed to initialize real Prisma client. Falling back to Mock.", err);
        prismaInstance = mockPrisma;
      }
    } else {
      console.warn("[AI Studio] DATABASE_URL is not set. Falling back to fully functional In-Memory Mock Database.");
      prismaInstance = mockPrisma;
    }
  }
  return prismaInstance;
}

const prisma = new Proxy({} as any, {
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
