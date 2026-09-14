import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAyahDto } from './dto/create-ayah.dto';
import { UpdateAyahDto } from './dto/update-ayah.dto';

@Injectable()
export class AyahsService {
  constructor(private prisma: PrismaService) {}

  findAll(surahId?: number) {
    return this.prisma.ayah.findMany({
      where: surahId ? { surahId } : undefined,
      orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const ayah = await this.prisma.ayah.findUnique({
      where: { id },
      include: { translations: true, surah: true },
    });
    if (!ayah) throw new NotFoundException('Ayah not found');
    return ayah;
  }

  create(dto: CreateAyahDto) {
    return this.prisma.ayah.create({ data: dto });
  }

  async update(id: string, dto: UpdateAyahDto) {
    try {
      return await this.prisma.ayah.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Ayah not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.ayah.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Ayah not found');
    }
  }
}
