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

  // Seed Vehicles inventory - expanded with diverse premium cars
  const vehiclesData = [
    {
      make: 'Tesla',
      model: 'Model Y Long Range',
      category: 'Electric SUV',
      price: 47990.00,
      quantity: 5,
      createdById: admin.id,
    },
    {
      make: 'Ford',
      model: 'Mustang Mach-E GT',
      category: 'Electric Crossover',
      price: 59995.00,
      quantity: 3,
      createdById: admin.id,
    },
    {
      make: 'Porsche',
      model: 'Taycan Cross Turismo',
      category: 'Electric Sport',
      price: 101900.00,
      quantity: 2,
      createdById: admin.id,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Prime Hybrid',
      category: 'Hybrid SUV',
      price: 43440.00,
      quantity: 7,
      createdById: admin.id,
    },
    {
      make: 'BMW',
      model: 'i4 M50 Gran Coupe',
      category: 'Electric Sedan',
      price: 69700.00,
      quantity: 4,
      createdById: admin.id,
    },
    {
      make: 'Porsche',
      model: '911 Carrera GTS',
      category: 'Performance Coupe',
      price: 150000.00,
      quantity: 1,
      createdById: admin.id,
    },
    {
      make: 'Chevrolet',
      model: 'Corvette C8 Stingray',
      category: 'Performance Coupe',
      price: 68300.00,
      quantity: 2,
      createdById: admin.id,
    },
    {
      make: 'Audi',
      model: 'e-tron GT RS',
      category: 'Electric Sport',
      price: 106500.00,
      quantity: 2,
      createdById: admin.id,
    },
    {
      make: 'Mercedes-Benz',
      model: 'AMG GT 53',
      category: 'Performance Sedan',
      price: 113500.00,
      quantity: 3,
      createdById: admin.id,
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Performance Coupe',
      price: 78100.00,
      quantity: 4,
      createdById: admin.id,
    },
    {
      make: 'Ford',
      model: 'Mustang Dark Horse',
      category: 'Performance Coupe',
      price: 59270.00,
      quantity: 5,
      createdById: admin.id,
    },
    {
      make: 'Toyota',
      model: 'GR Supra 3.0',
      category: 'Performance Coupe',
      price: 54500.00,
      quantity: 3,
      createdById: admin.id,
    },
    {
      make: 'Audi',
      model: 'Q8 e-tron',
      category: 'Electric SUV',
      price: 74400.00,
      quantity: 6,
      createdById: admin.id,
    },
    {
      make: 'Tesla',
      model: 'Model S Plaid',
      category: 'Electric Sedan',
      price: 89990.00,
      quantity: 2,
      createdById: admin.id,
    },
    {
      make: 'Dodge',
      model: 'Charger SRT Hellcat',
      category: 'Performance Sedan',
      price: 82650.00,
      quantity: 2,
      createdById: admin.id,
    }
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
