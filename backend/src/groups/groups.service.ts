import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Stub for future chat — minimal list/create only */
@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.group.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
      },
    });
  }

  create(ownerId: string, name: string, description?: string) {
    return this.prisma.group.create({
      data: {
        name,
        description,
        ownerId,
        members: { create: { userId: ownerId } },
      },
    });
  }

  listMessages(groupId: string) {
    return this.prisma.message.findMany({
      where: { groupId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
