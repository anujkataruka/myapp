import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fresh Vegetables' },
      update: {},
      create: {
        name: 'Fresh Vegetables',
        description: 'Fresh and organic vegetables',
        imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Fresh Fruits' },
      update: {},
      create: {
        name: 'Fresh Fruits',
        description: 'Seasonal and exotic fruits',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Dairy Products' },
      update: {},
      create: {
        name: 'Dairy Products',
        description: 'Fresh dairy products and alternatives',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Grains & Cereals' },
      update: {},
      create: {
        name: 'Grains & Cereals',
        description: 'Rice, wheat, quinoa and other grains',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Meat & Poultry' },
      update: {},
      create: {
        name: 'Meat & Poultry',
        description: 'Fresh meat and poultry products',
        imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400'
      }
    })
  ]);

  console.log('Categories created:', categories.length);

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 12);

  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor1@example.com' },
    update: {},
    create: {
      email: 'vendor1@example.com',
      passwordHash,
      userType: UserType.VENDOR,
      companyName: 'Fresh Farm Co.',
      contactPerson: 'John Smith',
      phone: '+1234567890',
      address: '123 Farm Road, Agricultural District',
      isVerified: true
    }
  });

  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor2@example.com' },
    update: {},
    create: {
      email: 'vendor2@example.com',
      passwordHash,
      userType: UserType.VENDOR,
      companyName: 'Organic Supplies Ltd.',
      contactPerson: 'Sarah Johnson',
      phone: '+1234567891',
      address: '456 Organic Street, Green Valley',
      isVerified: true
    }
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      passwordHash,
      userType: UserType.CUSTOMER,
      companyName: 'Restaurant Alpha',
      contactPerson: 'Mike Wilson',
      phone: '+1234567892',
      address: '789 Business Ave, Downtown',
      isVerified: true
    }
  });

  console.log('Test users created');

  // Create sample products
  const vegetableCategory = categories.find(c => c.name === 'Fresh Vegetables');
  const fruitCategory = categories.find(c => c.name === 'Fresh Fruits');
  const dairyCategory = categories.find(c => c.name === 'Dairy Products');

  const products = await Promise.all([
    // Vendor 1 products
    prisma.product.create({
      data: {
        vendorId: vendor1.id,
        categoryId: vegetableCategory!.id,
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes, perfect for restaurants',
        price: 2.50,
        unit: 'kg',
        stockQuantity: 1000,
        minOrderQty: 10,
        images: ['https://images.unsplash.com/photo-1546470427-227ceb8f99b2?w=400'],
        isFeatured: true
      }
    }),
    prisma.product.create({
      data: {
        vendorId: vendor1.id,
        categoryId: vegetableCategory!.id,
        name: 'Fresh Carrots',
        description: 'Crisp and sweet carrots from local farms',
        price: 1.80,
        unit: 'kg',
        stockQuantity: 800,
        minOrderQty: 5,
        images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400']
      }
    }),
    prisma.product.create({
      data: {
        vendorId: vendor1.id,
        categoryId: fruitCategory!.id,
        name: 'Premium Apples',
        description: 'Crispy red apples, grade A quality',
        price: 3.20,
        unit: 'kg',
        stockQuantity: 500,
        minOrderQty: 10,
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'],
        isFeatured: true
      }
    }),

    // Vendor 2 products
    prisma.product.create({
      data: {
        vendorId: vendor2.id,
        categoryId: dairyCategory!.id,
        name: 'Organic Milk',
        description: 'Fresh organic milk from grass-fed cows',
        price: 4.50,
        unit: 'liter',
        stockQuantity: 200,
        minOrderQty: 20,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400']
      }
    }),
    prisma.product.create({
      data: {
        vendorId: vendor2.id,
        categoryId: dairyCategory!.id,
        name: 'Artisan Cheese',
        description: 'Handcrafted cheese from local artisans',
        price: 15.00,
        unit: 'kg',
        stockQuantity: 50,
        minOrderQty: 2,
        images: ['https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400'],
        isFeatured: true
      }
    }),
    prisma.product.create({
      data: {
        vendorId: vendor2.id,
        categoryId: fruitCategory!.id,
        name: 'Organic Bananas',
        description: 'Sweet and ripe organic bananas',
        price: 2.00,
        unit: 'kg',
        stockQuantity: 300,
        minOrderQty: 15,
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400']
      }
    })
  ]);

  console.log('Sample products created:', products.length);

  console.log('Database seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('Vendor 1: vendor1@example.com / password123');
  console.log('Vendor 2: vendor2@example.com / password123');
  console.log('Customer: customer1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });