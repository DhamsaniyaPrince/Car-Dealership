import { Car, Prisma } from '@prisma/client';
import { ICarRepository, IAuditLogRepository, CarFilterParams } from '../repositories/interfaces';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';

export class CarService {
  constructor(
    private carRepository: ICarRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async getCars(filters: CarFilterParams): Promise<{ cars: Car[]; total: number }> {
    return this.carRepository.findAll(filters);
  }

  async getCarById(id: string): Promise<Car> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundError('Car not found');
    }
    return car;
  }

  async createCar(data: Prisma.CarCreateInput, creatorId: string): Promise<Car> {
    const existingCar = await this.carRepository.findByVin(data.vin);
    if (existingCar) {
      throw new ConflictError('A car with this VIN already exists');
    }

    const car = await this.carRepository.create(data);

    await this.auditLogRepository.create({
      userId: creatorId,
      action: 'CAR_CREATED',
      details: { carId: car.id, vin: car.vin, make: car.make, model: car.model },
    });

    return car;
  }

  async updateCar(id: string, data: Prisma.CarUpdateInput, editorId: string): Promise<Car> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    if (data.vin && typeof data.vin === 'string') {
      const existingCar = await this.carRepository.findByVin(data.vin);
      if (existingCar && existingCar.id !== id) {
        throw new ConflictError('A car with this VIN already exists');
      }
    }

    const updatedCar = await this.carRepository.update(id, data);

    await this.auditLogRepository.create({
      userId: editorId,
      action: 'CAR_UPDATED',
      details: { carId: id, updates: data },
    });

    return updatedCar;
  }

  async deleteCar(id: string, deleterId: string): Promise<Car> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    if (car.status === 'SOLD') {
      throw new BadRequestError('Cannot delete a sold car');
    }

    const deletedCar = await this.carRepository.delete(id);

    await this.auditLogRepository.create({
      userId: deleterId,
      action: 'CAR_DELETED',
      details: { carId: id, vin: car.vin, make: car.make, model: car.model },
    });

    return deletedCar;
  }
}
