import { prisma } from '../../lib/prisma';
import { User, Prisma } from '@prisma/client';

const includeProfiles = {
  residentProfile: true,
  adminProfile: true,
  driverProfile: { include: { vehicle: true } },
};

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ 
      where: { email },
      include: includeProfiles
    });
  }

  async findUserByMobile(mobile: string) {
    return prisma.user.findUnique({ 
      where: { mobile },
      include: includeProfiles
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      include: includeProfiles
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ 
      data,
      include: includeProfiles
    });
  }
}

export const authRepository = new AuthRepository();
