import { Router } from 'express';
import { carController } from '../config/di';
import { authGuard, roleGuard } from '../middleware/authGuard';
import { validateRequest } from '../middleware/validateRequest';
import { carCreateSchema, carUpdateSchema } from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', carController.getCars);
router.get('/:id', carController.getCarById);

router.post(
  '/',
  authGuard,
  roleGuard([Role.ADMIN, Role.SALES]),
  validateRequest(carCreateSchema),
  carController.createCar
);

router.put(
  '/:id',
  authGuard,
  roleGuard([Role.ADMIN, Role.SALES]),
  validateRequest(carUpdateSchema),
  carController.updateCar
);

router.delete(
  '/:id',
  authGuard,
  roleGuard([Role.ADMIN, Role.SALES]),
  carController.deleteCar
);

export default router;
