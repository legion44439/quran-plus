import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  findAll(categoryId?: string) {
    return this.prisma.video.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.video.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!row) throw new NotFoundException('Video not found');
    return row;
  }

  create(dto: CreateVideoDto) {
    return this.prisma.video.create({ data: dto });
  }

  async update(id: string, dto: UpdateVideoDto) {
    try {
      return await this.prisma.video.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Video not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.video.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Video not found');
    }
  }
}
