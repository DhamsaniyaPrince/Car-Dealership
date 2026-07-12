import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { IUserRepository, IAuditLogRepository } from '../repositories/interfaces';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async register(data: {
    email: string;
    passwordHash: string; // Plain password passed into method
    name: string;
  }): Promise<{ user: Omit<User, 'password'> }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);

    const newUser = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: Role.USER, // Default user role
    });

    await this.auditLogRepository.create({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      details: { email: newUser.email },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  }

  async login(
    email: string,
    passwordPlain: string
  ): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(passwordPlain, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.auditLogRepository.create({
      userId: user.id,
      action: 'USER_LOGGED_IN',
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; payload: TokenPayload }> {
    try {
      const { verifyRefreshToken } = require('../utils/jwt');
      const payload = verifyRefreshToken(refreshToken) as TokenPayload;

      const user = await this.userRepository.findById(payload.id);
      if (!user) {
        throw new UnauthorizedError('User session invalid');
      }

      const freshPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(freshPayload);
      return { accessToken, payload: freshPayload };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User session expired');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
