import { Role, User } from '@prisma/client';
import { IUserRepository, IAuditLogRepository } from '../repositories/interfaces';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.findAll();
    return users.map(({ passwordHash: _, ...userWithoutHash }) => userWithoutHash);
  }

  async updateUserRole(id: string, role: Role, adminId: string): Promise<Omit<User, 'passwordHash'>> {
    if (id === adminId) {
      throw new BadRequestError('Cannot change your own role');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.updateRole(id, role);

    await this.auditLogRepository.create({
      userId: adminId,
      action: 'USER_ROLE_UPDATED',
      details: { targetUserId: id, oldRole: user.role, newRole: role },
    });

    const { passwordHash: _, ...userWithoutHash } = updatedUser;
    return userWithoutHash;
  }
}
