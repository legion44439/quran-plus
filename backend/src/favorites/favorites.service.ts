import { Injectable } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  add(userId: string, targetType: ContentType, targetId: string) {
    return this.prisma.favorite.upsert({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
      create: { userId, targetType, targetId },
      update: {},
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.favorite.deleteMany({ where: { id, userId } });
    return { success: true };
  }
}
