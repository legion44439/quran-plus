import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Injectable()
export class TranslationsService {
  constructor(private prisma: PrismaService) {}

  findAll(ayahId?: string, language?: string) {
    return this.prisma.translation.findMany({
      where: {
        ...(ayahId ? { ayahId } : {}),
        ...(language ? { language } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.translation.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Translation not found');
    return row;
  }

  create(dto: CreateTranslationDto) {
    return this.prisma.translation.create({ data: dto });
  }

  async update(id: string, dto: UpdateTranslationDto) {
    try {
      return await this.prisma.translation.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Translation not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.translation.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Translation not found');
    }
  }
}
