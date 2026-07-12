import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../setup';
import { generateAccessToken } from '../../src/utils/jwt';
import { Role } from '@prisma/client';

describe('Vehicles Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_12345678';
    
    adminToken = generateAccessToken({
      id: 'admin-uuid-999',
      email: 'admin@dealership.com',
      role: Role.ADMIN,
    });

    userToken = generateAccessToken({
      id: 'user-uuid-999',
      email: 'user@dealership.com',
      role: Role.USER,
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return paginated list of vehicles (Public access)', async () => {
      const mockVehicle = {
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        category: 'Electric SUV',
        price: 49990.0,
        quantity: 5,
        createdById: 'admin-uuid-999',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.vehicle.findMany.mockResolvedValue([mockVehicle]);
      prismaMock.vehicle.count.mockResolvedValue(1);

      const response = await request(app).get('/api/vehicles?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.vehicles).toHaveLength(1);
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('should execute catalog search filters (Public access)', async () => {
      const mockVehicle = {
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        category: 'Electric SUV',
        price: 49990.0,
        quantity: 5,
        createdById: 'admin-uuid-999',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.vehicle.findMany.mockResolvedValue([mockVehicle]);
      prismaMock.vehicle.count.mockResolvedValue(1);

      const response = await request(app).get(
        '/api/vehicles/search?make=Tesla&model=Model+Y&category=Electric+SUV&minPrice=40000&maxPrice=60000'
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.vehicles).toHaveLength(1);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return single vehicle specs (Public access)', async () => {
      const mockVehicle = {
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        category: 'Electric SUV',
        price: 49990.0,
        quantity: 5,
        createdById: 'admin-uuid-999',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const response = await request(app).get('/api/vehicles/vehicle-uuid-1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /api/vehicles', () => {
    const validVehiclePayload = {
      make: 'Porsche',
      model: 'Taycan',
      category: 'Electric Sport',
      price: 90900.0,
      quantity: 2,
    };

    it('should allow Admin to create a vehicle', async () => {
      prismaMock.vehicle.create.mockResolvedValue({
        id: 'vehicle-uuid-2',
        ...validVehiclePayload,
        price: validVehiclePayload.price as any,
        createdById: 'admin-uuid-999',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validVehiclePayload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });

    it('should block standard User from creating a vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehiclePayload);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow authenticated client to purchase stock (decreases quantity)', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 5,
      } as any);

      prismaMock.vehicle.update.mockResolvedValue({
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 4,
      } as any);

      const response = await request(app)
        .post('/api/vehicles/vehicle-uuid-1/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.vehicle.quantity).toBe(4);
    });

    it('should block purchase and return 400 if quantity is zero', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 0,
      } as any);

      const response = await request(app)
        .post('/api/vehicles/vehicle-uuid-1/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot purchase if quantity is zero');
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow Admin to restock quantity', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 0,
      } as any);

      prismaMock.vehicle.update.mockResolvedValue({
        id: 'vehicle-uuid-1',
        make: 'Tesla',
        model: 'Model Y',
        quantity: 10,
      } as any);

      const response = await request(app)
        .post('/api/vehicles/vehicle-uuid-1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.vehicle.quantity).toBe(10);
    });

    it('should return 403 Forbidden if requested by standard user', async () => {
      const response = await request(app)
        .post('/api/vehicles/vehicle-uuid-1/restock')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(403);
    });

    it('should return 400 for negative restock value', async () => {
      const response = await request(app)
        .post('/api/vehicles/vehicle-uuid-1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });

      expect(response.status).toBe(400);
    });
  });
});
