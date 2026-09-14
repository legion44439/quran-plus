import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReciterDto } from './dto/create-reciter.dto';
import { UpdateReciterDto } from './dto/update-reciter.dto';

@Injectable()
export class RecitersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.reciter.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.reciter.findUnique({
      where: { id },
      include: { audioTracks: true },
    });
    if (!row) throw new NotFoundException('Reciter not found');
    return row;
  }

  create(dto: CreateReciterDto) {
    return this.prisma.reciter.create({ data: dto });
  }

  async update(id: string, dto: UpdateReciterDto) {
    try {
      return await this.prisma.reciter.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Reciter not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.reciter.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Reciter not found');
    }
  }
}
