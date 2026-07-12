import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../setup';
import * as bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user with standard USER role', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-uuid-111',
        email: 'register@dealership.com',
        name: 'New Registered User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'register@dealership.com',
          password: 'SecurePassword123!',
          name: 'New Registered User',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('register@dealership.com');
      expect(response.body.data.user.role).toBe('USER');
      expect((response.body.data.user as any).password).toBeUndefined();
    });

    it('should return 400 for invalid inputs', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bad-email',
          password: '123', // Too short (min 8)
          name: '',        // Too short (min 2)
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login on valid credentials and return access token + refresh cookie', async () => {
      const hashed = await bcrypt.hash('CorrectPass123!', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-222',
        email: 'login@dealership.com',
        name: 'Logged User',
        password: hashed,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@dealership.com',
          password: 'CorrectPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe('login@dealership.com');
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 401 for incorrect credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@dealership.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
