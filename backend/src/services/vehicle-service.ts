import { Vehicle, Prisma } from '@prisma/client';
import { IVehicleRepository, IAuditLogRepository, VehicleFilterParams } from '../repositories/interfaces';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class VehicleService {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async getVehicles(filters: VehicleFilterParams): Promise<{ vehicles: Vehicle[]; total: number }> {
    return this.vehicleRepository.findAll(filters);
  }

  async searchVehicles(filters: VehicleFilterParams): Promise<{ vehicles: Vehicle[]; total: number }> {
    return this.vehicleRepository.findAll(filters);
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }
    return vehicle;
  }

  async createVehicle(data: Omit<Prisma.VehicleCreateInput, 'createdBy'>, adminId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.create({
      ...data,
      createdBy: { connect: { id: adminId } },
    });

    await this.auditLogRepository.create({
      userId: adminId,
      action: 'VEHICLE_CREATED',
      details: { vehicleId: vehicle.id, make: vehicle.make, model: vehicle.model },
    });

    return vehicle;
  }

  async updateVehicle(id: string, data: Prisma.VehicleUpdateInput, adminId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const updatedVehicle = await this.vehicleRepository.update(id, data);

    await this.auditLogRepository.create({
      userId: adminId,
      action: 'VEHICLE_UPDATED',
      details: JSON.parse(JSON.stringify({ vehicleId: id, updates: data })),
    });

    return updatedVehicle;
  }

  async deleteVehicle(id: string, adminId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const deletedVehicle = await this.vehicleRepository.delete(id);

    await this.auditLogRepository.create({
      userId: adminId,
      action: 'VEHICLE_DELETED',
      details: { vehicleId: id, make: vehicle.make, model: vehicle.model },
    });

    return deletedVehicle;
  }

  async purchaseVehicle(id: string, userId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.quantity <= 0) {
      throw new BadRequestError('Cannot purchase if quantity is zero');
    }

    // Atomic decrement operation utilizing Prisma
    const updatedVehicle = await this.vehicleRepository.update(id, {
      quantity: { decrement: 1 },
    });

    await this.auditLogRepository.create({
      userId,
      action: 'VEHICLE_PURCHASED',
      details: { vehicleId: id, make: vehicle.make, model: vehicle.model },
    });

    return updatedVehicle;
  }

  async restockVehicle(id: string, quantity: number, adminId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    // Atomic increment operation utilizing Prisma
    const updatedVehicle = await this.vehicleRepository.update(id, {
      quantity: { increment: quantity },
    });

    await this.auditLogRepository.create({
      userId: adminId,
      action: 'VEHICLE_RESTOCKED',
      details: { vehicleId: id, added: quantity, newQuantity: updatedVehicle.quantity },
    });

    return updatedVehicle;
  }
}
