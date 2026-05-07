import { prisma } from '../../lib/prisma';
import { User, Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserByMobile(mobile: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { mobile } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }
}

export const authRepository = new AuthRepository();
