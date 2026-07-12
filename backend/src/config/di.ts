import {
  PrismaUserRepository,
  PrismaVehicleRepository,
  PrismaAuditLogRepository,
} from '../repositories/prisma-repos';
import { AuthService } from '../services/auth-service';
import { VehicleService } from '../services/vehicle-service';
import { AuthController } from '../controllers/auth-controller';
import { VehicleController } from '../controllers/vehicle-controller';

// Repositories
export const userRepository = new PrismaUserRepository();
export const vehicleRepository = new PrismaVehicleRepository();
export const auditLogRepository = new PrismaAuditLogRepository();

// Services
export const authService = new AuthService(userRepository, auditLogRepository);
export const vehicleService = new VehicleService(vehicleRepository, auditLogRepository);

// Controllers
export const authController = new AuthController(authService);
export const vehicleController = new VehicleController(vehicleService);
