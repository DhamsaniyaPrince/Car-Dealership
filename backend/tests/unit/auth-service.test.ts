import { AuthService } from '../../src/services/auth-service';
import { IUserRepository, IAuditLogRepository } from '../../src/repositories/interfaces';
import { ConflictError, UnauthorizedError } from '../../src/utils/errors';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService Unit Tests', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuditLogRepository: jest.Mocked<IAuditLogRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRole: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockAuditLogRepository = {
      create: jest.fn(),
    } as any;

    // customerRepository is no longer required in our updated User schema!
    authService = new AuthService(mockUserRepository, mockAuditLogRepository);
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@dealership.com',
      passwordHash: 'Password123!',
      name: 'New User',
    };

    it('should hash password and create a new user profile', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation(async (data: any) => ({
        id: 'new-uuid',
        email: data.email,
        name: data.name,
        password: data.password, // bcrypt hashed in service
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await authService.register(registerData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
      
      const createdArgs = mockUserRepository.create.mock.calls[0][0];
      expect(createdArgs.email).toBe(registerData.email);
      expect(createdArgs.name).toBe(registerData.name);
      
      // Password must be hashed (not equal to plain text)
      expect(createdArgs.password).not.toBe(registerData.passwordHash);
      expect(await bcrypt.compare(registerData.passwordHash, createdArgs.password)).toBe(true);
      
      expect(result.user.id).toBe('new-uuid');
      expect((result.user as any).password).toBeUndefined(); // Password hash must be stripped
    });

    it('should throw ConflictError if email is already registered', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: registerData.email,
      } as any);

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'user@dealership.com',
      password: 'UserPass123!',
    };

    it('should return user info and access/refresh tokens on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginCredentials.password, 10);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-id-123',
        email: loginCredentials.email,
        name: 'John Doe',
        password: hashedPassword,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login(loginCredentials.email, loginCredentials.password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(loginCredentials.email);
      expect((result.user as any).password).toBeUndefined(); // Shield password hashes
    });

    it('should throw UnauthorizedError if user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login(loginCredentials.email, loginCredentials.password)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError on password mismatch', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-id-123',
        email: loginCredentials.email,
        password: hashedPassword,
      } as any);

      await expect(
        authService.login(loginCredentials.email, 'WrongPassword123!')
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
