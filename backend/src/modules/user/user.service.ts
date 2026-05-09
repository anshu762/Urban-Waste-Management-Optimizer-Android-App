import { prisma } from '../../lib/prisma';
import { UpdateProfileInput } from './user.schema';

export class UserService {
  async updateResidentProfile(userId: string, data: UpdateProfileInput) {
    const profile = await prisma.residentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Resident profile not found');
    }

    const updated = await prisma.residentProfile.update({
      where: { userId },
      data,
    });

    return updated;
  }

  async listDrivers() {
    return prisma.driverProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        vehicle: true,
      }
    });
  }

  async updatePushToken(userId: string, pushToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { pushToken },
      select: {
        id: true,
        pushToken: true,
      },
    });
  }
}

export const userService = new UserService();
