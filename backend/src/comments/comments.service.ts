import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Stub — list/create wired to Prisma; full moderation later */
@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.comment.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, displayName: true } } },
    });
  }

  create(userId: string, body: string, targetType: string, targetId: string) {
    return this.prisma.comment.create({
      data: {
        userId,
        body,
        targetType: targetType as any,
        targetId,
      },
    });
  }
}
