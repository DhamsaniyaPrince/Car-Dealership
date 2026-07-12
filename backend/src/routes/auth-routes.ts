import { Router } from 'express';
import { authController } from '../config/di';
import { validateRequest } from '../middleware/validateRequest';
import { authGuard } from '../middleware/authGuard';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authGuard, authController.me);

export default router;
