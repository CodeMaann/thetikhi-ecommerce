import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const ADMIN_USER = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== 'production' ? 'CHANGE_ME' : '');
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'CHANGE_ME' : '');

  if (ADMIN_USER && ADMIN_PASS) {
    const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_USER } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(ADMIN_PASS, 10);
      await prisma.user.create({
        data: {
          email: ADMIN_USER,
          name: 'Admin',
          passwordHash,
          role: 'admin',
        },
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
  }

  const productsToSeed = [
    {
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
  ];

  for (const productData of productsToSeed) {
    // Try to find the product by matching its weight or name in the old seed
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { name: productData.name },
          { weight: productData.weight }
        ]
      }
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: productData
      });
      console.log(`Updated product: ${productData.name}`);
    } else {
      await prisma.product.create({
        data: productData
      });
      console.log(`Created product: ${productData.name}`);
    }
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
