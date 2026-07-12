import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.register({
        email,
        passwordHash: password, // Map field for registration password hashing
        name,
      });
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth', // Adjusted path to match route prefix
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: 'success',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
        const [key, val] = cookie.trim().split('=');
        acc[key] = val;
        return acc;
      }, {} as Record<string, string>);

      const refreshToken = cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const { accessToken, payload } = await this.authService.refresh(refreshToken);

      res.status(200).json({
        status: 'success',
        data: { accessToken, user: { id: payload.id, email: payload.email, role: payload.role } },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
      });
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      _next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const user = await this.authService.getMe(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
