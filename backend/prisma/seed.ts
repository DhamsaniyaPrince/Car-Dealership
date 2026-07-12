import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with new User and Vehicle schema...');

  // Clear existing tables
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  const userPasswordHash = await bcrypt.hash('Customer@1234', 10);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dealership.com',
      name: 'Admin Manager',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Create standard user
  await prisma.user.create({
    data: {
      email: 'customer@dealership.com',
      name: 'Standard Client',
      password: userPasswordHash,
      role: Role.USER,
    },
  });

  // Seed Vehicles inventory
  const vehiclesData = [
    {
      make: 'Tesla',
      model: 'Model Y',
      category: 'Electric SUV',
      price: 47990.00,
      quantity: 5,
      createdById: admin.id,
    },
    {
      make: 'Ford',
      model: 'Mustang Mach-E',
      category: 'Electric Crossover',
      price: 42995.00,
      quantity: 3,
      createdById: admin.id,
    },
    {
      make: 'Porsche',
      model: 'Taycan',
      category: 'Electric Sport',
      price: 90900.00,
      quantity: 2,
      createdById: admin.id,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Prime',
      category: 'Hybrid SUV',
      price: 43440.00,
      quantity: 7,
      createdById: admin.id,
    },
    {
      make: 'BMW',
      model: 'i4',
      category: 'Electric Sedan',
      price: 52200.00,
      quantity: 4,
      createdById: admin.id,
    },
  ];

  for (const vehicle of vehiclesData) {
    await prisma.vehicle.create({
      data: vehicle,
    });
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
