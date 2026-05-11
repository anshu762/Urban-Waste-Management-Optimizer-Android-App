import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';
import { signToken } from '../../lib/jwt';
import { UserRole } from '@prisma/client';
import { Errors } from '../../lib/app-error';

export class AuthService {
  async registerUser(dto: RegisterInput) {
    if (dto.email) {
      const existing = await authRepository.findUserByEmail(dto.email);
      if (existing) throw Errors.alreadyExists('This email');
    }
    if (dto.mobile) {
      const existing = await authRepository.findUserByMobile(dto.mobile);
      if (existing) throw Errors.alreadyExists('This phone number');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await authRepository.createUser({
      fullName: dto.fullName,
      email: dto.email,
      mobile: dto.mobile,
      passwordHash,
      role: dto.role as UserRole,
      residentProfile: dto.role === 'RESIDENT' ? { create: {} } : undefined,
      adminProfile: dto.role === 'ADMIN' ? { create: {} } : undefined,
      driverProfile: dto.role === 'DRIVER' ? { create: {} } : undefined,
    });

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async loginUser(dto: LoginInput) {
    const user = dto.email 
      ? await authRepository.findUserByEmail(dto.email)
      : await authRepository.findUserByMobile(dto.mobile!);

    if (!user || !user.passwordHash) {
      throw Errors.invalidCredentials();
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw Errors.invalidCredentials();
    }

    if (!user.isActive) {
      throw Errors.unauthorized();
    }

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw Errors.userNotFound();
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
