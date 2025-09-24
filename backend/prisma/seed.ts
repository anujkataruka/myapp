import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  // User
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', passwordHash, role: 'USER' },
  });

  // Vendor and products
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: { email: 'vendor@example.com', passwordHash, role: 'VENDOR' },
  });

  let vendor = await prisma.vendor.findUnique({ where: { userId: vendorUser.id } });
  if (!vendor) {
    vendor = await prisma.vendor.create({ data: { userId: vendorUser.id, businessName: 'Vendor Mart' } });
  }

  const existingProducts = await prisma.product.findMany({ where: { vendorId: vendor.id } });
  if (existingProducts.length === 0) {
    await prisma.product.createMany({
      data: [
        { vendorId: vendor.id, title: 'Bananas', description: 'Fresh bananas', priceCents: 199, currency: 'USD', inventoryQuantity: 200 },
        { vendorId: vendor.id, title: 'Apples', description: 'Crisp apples', priceCents: 249, currency: 'USD', inventoryQuantity: 150 },
        { vendorId: vendor.id, title: 'Milk', description: 'Whole milk 1L', priceCents: 299, currency: 'USD', inventoryQuantity: 80 },
      ],
    });
  }

  console.log('Seed completed. Users: user@example.com / vendor@example.com, password: password123');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

