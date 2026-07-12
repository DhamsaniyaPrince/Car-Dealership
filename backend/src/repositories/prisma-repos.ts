import { User, Vehicle, Role, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  IVehicleRepository,
  IUserRepository,
  IAuditLogRepository,
  VehicleFilterParams,
} from './interfaces';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class PrismaVehicleRepository implements IVehicleRepository {
  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async create(data: Prisma.VehicleCreateInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  async update(id: string, data: Prisma.VehicleUpdateInput): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: data,
    });
  }

  async delete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({ where: { id } });
  }

  async findAll(filters: VehicleFilterParams): Promise<{ vehicles: Vehicle[]; total: number }> {
    const {
      make,
      model,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (make) {
      where.make = { equals: make, mode: 'insensitive' };
    }

    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { vehicles, total };
  }
}

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(_data: { userId?: string; action: string; details?: Prisma.InputJsonValue }): Promise<void> {
    // Audit log table removed in updated schema; this acts as a no-op to support compatibility.
  }
}
