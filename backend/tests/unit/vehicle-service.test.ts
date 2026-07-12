import { VehicleService } from '../../src/services/vehicle-service';
import { IVehicleRepository, IAuditLogRepository } from '../../src/repositories/interfaces';
import { NotFoundError, BadRequestError } from '../../src/utils/errors';

describe('VehicleService Unit Tests', () => {
  let vehicleService: VehicleService;
  let mockVehicleRepository: jest.Mocked<IVehicleRepository>;
  let mockAuditLogRepository: jest.Mocked<IAuditLogRepository>;

  beforeEach(() => {
    mockVehicleRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockAuditLogRepository = {
      create: jest.fn(),
    } as any;

    vehicleService = new VehicleService(mockVehicleRepository, mockAuditLogRepository);
  });

  describe('getVehicles & searchVehicles', () => {
    it('should query all vehicles based on filters', async () => {
      const mockResult = {
        vehicles: [
          { id: 'v-1', make: 'Tesla', model: 'Model Y', category: 'Electric SUV', price: 45000, quantity: 2 },
        ] as any[],
        total: 1,
      };

      mockVehicleRepository.findAll.mockResolvedValue(mockResult);

      const filters = { make: 'Tesla', page: 1, limit: 10 };
      const result = await vehicleService.getVehicles(filters);

      expect(mockVehicleRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result.vehicles).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should query search parameters mapping make, model, category, and price range', async () => {
      const searchFilters = {
        make: 'Ford',
        model: 'Mustang',
        category: 'Sport',
        minPrice: 30000,
        maxPrice: 60000,
      };
      
      mockVehicleRepository.findAll.mockResolvedValue({
        vehicles: [{ id: 'v-2', make: 'Ford', model: 'Mustang' }] as any[],
        total: 1,
      });

      const result = await vehicleService.searchVehicles(searchFilters);

      expect(mockVehicleRepository.findAll).toHaveBeenCalledWith(searchFilters);
      expect(result.vehicles).toHaveLength(1);
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle detail matching id', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model Y' } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);

      const result = await vehicleService.getVehicleById('v-1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('v-1');
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundError if vehicle does not exist', async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      await expect(vehicleService.getVehicleById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createVehicle', () => {
    it('should create a new vehicle entry and register audit log', async () => {
      const vehicleData = {
        make: 'Tesla',
        model: 'Model 3',
        category: 'Sedan',
        price: 39990.0,
        quantity: 5,
      } as any;

      mockVehicleRepository.create.mockResolvedValue({
        id: 'new-vehicle-uuid',
        ...vehicleData,
      });

      const result = await vehicleService.createVehicle(vehicleData, 'admin-uuid-1');

      expect(mockVehicleRepository.create).toHaveBeenCalledWith({
        ...vehicleData,
        createdBy: { connect: { id: 'admin-uuid-1' } },
      });
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('new-vehicle-uuid');
    });
  });

  describe('updateVehicle', () => {
    it('should update specs and register audit log', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model 3' } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleRepository.update.mockResolvedValue({
        id: 'v-1',
        make: 'Tesla',
        model: 'Model 3 Performance',
        price: 49990.0,
      } as any);

      const updates = { model: 'Model 3 Performance', price: 49990.0 };
      const result = await vehicleService.updateVehicle('v-1', updates, 'admin-uuid-1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('v-1');
      expect(mockVehicleRepository.update).toHaveBeenCalledWith('v-1', updates);
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
      expect(result.model).toBe('Model 3 Performance');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete record and register audit log', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model 3' } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleRepository.delete.mockResolvedValue(mockVehicle);

      const result = await vehicleService.deleteVehicle('v-1', 'admin-uuid-1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('v-1');
      expect(mockVehicleRepository.delete).toHaveBeenCalledWith('v-1');
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('purchaseVehicle', () => {
    it('should decrease quantity by 1 and record audit log', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model Y', quantity: 3 } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleRepository.update.mockResolvedValue({
        id: 'v-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 2,
      } as any);

      const result = await vehicleService.purchaseVehicle('v-1', 'user-uuid-1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('v-1');
      expect(mockVehicleRepository.update).toHaveBeenCalledWith('v-1', {
        quantity: { decrement: 1 },
      });
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        action: 'VEHICLE_PURCHASED',
        details: { vehicleId: 'v-1', make: 'Tesla', model: 'Model Y' },
      });
      expect(result.quantity).toBe(2);
    });

    it('should throw BadRequestError if vehicle is out of stock', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model Y', quantity: 0 } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);

      await expect(vehicleService.purchaseVehicle('v-1', 'user-uuid-1')).rejects.toThrow(
        BadRequestError
      );
      expect(mockVehicleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('restockVehicle', () => {
    it('should increment quantity and log audit details', async () => {
      const mockVehicle = { id: 'v-1', make: 'Tesla', model: 'Model Y', quantity: 1 } as any;
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleRepository.update.mockResolvedValue({
        id: 'v-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 11,
      } as any);

      const result = await vehicleService.restockVehicle('v-1', 10, 'admin-uuid-1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('v-1');
      expect(mockVehicleRepository.update).toHaveBeenCalledWith('v-1', {
        quantity: { increment: 10 },
      });
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        userId: 'admin-uuid-1',
        action: 'VEHICLE_RESTOCKED',
        details: { vehicleId: 'v-1', added: 10, newQuantity: 11 },
      });
      expect(result.quantity).toBe(11);
    });
  });
});
