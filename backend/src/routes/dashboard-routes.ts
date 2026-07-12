import { Router } from 'express';
import { transactionController } from '../config/di';
import { authGuard, roleGuard } from '../middleware/authGuard';
import { Role } from '@prisma/client';

const router = Router();

router.use(authGuard);
router.use(roleGuard([Role.ADMIN, Role.SALES]));

router.get('/metrics', transactionController.getDashboardMetrics);

export default router;
