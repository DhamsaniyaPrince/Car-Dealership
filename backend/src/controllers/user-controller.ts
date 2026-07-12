import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const { id } = req.params;
      const { role } = req.body;
      const user = await this.userService.updateUserRole(id, role, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
