import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(
    actorId: string,
    action: string,
    entity: string,
    entityId?: string,
    meta?: Prisma.InputJsonValue,
  ) {
    return this.prisma.adminAuditLog.create({
      data: { actorId, action, entity, entityId, meta },
    });
  }

  findAll(take = 100) {
    return this.prisma.adminAuditLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, email: true, role: true } },
      },
    });
  }
}
