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
      images: []
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
      images: []
    }
  ],
  user: [
    {
      id: "admin_1",
      email: "CHANGE_ME",
      name: "Admin",
      passwordHash: "$2a$10$wT/pZ/mP/P5T9542Z5G9X.KqR4E52K1yPZ/4qA3xH/H7Tq9m9X2xS", // mock hash
      role: "admin"
    }
  ],
  siteSetting: []
};

const createModelMock = (modelName: string) => {
  if (!memDb[modelName]) memDb[modelName] = [];
  
  return {
    findMany: async () => memDb[modelName],
    findUnique: async ({ where }: any) => memDb[modelName].find((item: any) => Object.keys(where).every(k => item[k] === where[k])),
    findFirst: async ({ where }: any) => {
      if (!where) return memDb[modelName][0];
      return memDb[modelName].find((item: any) => Object.keys(where).every(k => item[k] === where[k]))
    },
    create: async ({ data }: any) => {
      const id = Math.random().toString(36).substring(7);
      const newItem = { id, ...data };
      memDb[modelName].push(newItem);
      return newItem;
    },
    update: async ({ where, data }: any) => {
      const idx = memDb[modelName].findIndex((item: any) => Object.keys(where).every(k => item[k] === where[k]));
      if (idx !== -1) {
        memDb[modelName][idx] = { ...memDb[modelName][idx], ...data };
        return memDb[modelName][idx];
      }
      return null;
    },
    delete: async ({ where }: any) => {
       const idx = memDb[modelName].findIndex((item: any) => Object.keys(where).every(k => item[k] === where[k]));
       if (idx !== -1) {
         return memDb[modelName].splice(idx, 1)[0];
       }
       return null;
    },
    count: async () => memDb[modelName].length,
  }
}

export const prisma = new Proxy({} as any, {
  get: (target, prop: string) => {
    if (prop === '$connect' || prop === '$disconnect') return async () => {};
    if (prop === '$transaction') return async (args: any) => Array.isArray(args) ? Promise.all(args) : args(prisma);
    return createModelMock(prop);
  }
});

export default prisma;
