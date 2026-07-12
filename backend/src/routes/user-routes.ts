import { Router } from 'express';
import { userController } from '../config/di';
import { authGuard, roleGuard } from '../middleware/authGuard';
import { validateRequest } from '../middleware/validateRequest';
import { userRoleUpdateSchema } from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authGuard);

// Both ADMIN and SALES can retrieve user lists (essential for registering transactions)
router.get('/', roleGuard([Role.ADMIN, Role.SALES]), userController.getAllUsers);

// Only ADMIN can change user roles
router.patch('/:id/role', roleGuard([Role.ADMIN]), validateRequest(userRoleUpdateSchema), userController.updateUserRole);

export default router;
