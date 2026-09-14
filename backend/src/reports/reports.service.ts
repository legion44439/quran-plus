import { Injectable } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.report.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(
    userId: string,
    reason: string,
    targetType: ContentType,
    targetId: string,
    details?: string,
  ) {
    return this.prisma.report.create({
      data: { userId, reason, targetType, targetId, details },
    });
  }
}
