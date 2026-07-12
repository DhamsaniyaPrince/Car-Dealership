import { Router } from 'express';
import { transactionController } from '../config/di';
import { authGuard, roleGuard } from '../middleware/authGuard';
import { validateRequest } from '../middleware/validateRequest';
import { transactionCreateSchema } from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authGuard);
router.use(roleGuard([Role.ADMIN, Role.SALES]));

router.get('/', transactionController.getAllTransactions);
router.post('/', validateRequest(transactionCreateSchema), transactionController.createTransaction);

export default router;
