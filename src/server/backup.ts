import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  console.log('Starting backup...');

  const products = await prisma.product.findMany();
  const orders = await prisma.order.findMany();
  const coupons = await prisma.coupon.findMany();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  const data = {
    products,
    orders,
    coupons,
    users
  };

  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
  console.log(`Backup saved to ${backupFile}`);
}

main()
  .catch(e => {
    console.error('Backup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
