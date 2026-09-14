import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRole(id: string, role: Role) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
        },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }
}
