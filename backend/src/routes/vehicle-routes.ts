import { Router } from 'express';
import { vehicleController } from '../config/di';
import { authGuard, roleGuard } from '../middleware/authGuard';
import { validateRequest } from '../middleware/validateRequest';
import { vehicleCreateSchema, vehicleUpdateSchema, restockSchema } from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

// Publicly viewable catalog endpoints
router.get('/', vehicleController.getVehicles);

// REGISTER /search BEFORE /:id to avoid URL param hijack matches!
router.get('/search', vehicleController.searchVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Authenticated purchases (any registered User/Admin can buy)
router.post('/:id/purchase', authGuard, vehicleController.purchaseVehicle);

// Restocking inventory (locked to Admin role only)
router.post(
  '/:id/restock',
  authGuard,
  roleGuard([Role.ADMIN]),
  validateRequest(restockSchema),
  vehicleController.restockVehicle
);

// Locked inventory updates endpoints (Admin authority required)
router.post(
  '/',
  authGuard,
  roleGuard([Role.ADMIN]),
  validateRequest(vehicleCreateSchema),
  vehicleController.createVehicle
);

router.put(
  '/:id',
  authGuard,
  roleGuard([Role.ADMIN]),
  validateRequest(vehicleUpdateSchema),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  authGuard,
  roleGuard([Role.ADMIN]),
  vehicleController.deleteVehicle
);

export default router;
