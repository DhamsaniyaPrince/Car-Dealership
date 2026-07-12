import { User, Vehicle, Role, Prisma } from '@prisma/client';

export interface VehicleFilterParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  updateRole(id: string, role: Role): Promise<User>;
  findAll(): Promise<User[]>;
}

export interface IVehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  create(data: Prisma.VehicleCreateInput): Promise<Vehicle>;
  update(id: string, data: Prisma.VehicleUpdateInput): Promise<Vehicle>;
  delete(id: string): Promise<Vehicle>;
  findAll(filters: VehicleFilterParams): Promise<{ vehicles: Vehicle[]; total: number }>;
}

export interface IAuditLogRepository {
  create(data: { userId?: string; action: string; details?: Prisma.InputJsonValue }): Promise<void>;
}
