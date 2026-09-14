import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurahDto } from './dto/create-surah.dto';
import { UpdateSurahDto } from './dto/update-surah.dto';

@Injectable()
export class SurahsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.surah.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const surah = await this.prisma.surah.findUnique({
      where: { id },
      include: { ayahs: { orderBy: { number: 'asc' } } },
    });
    if (!surah) throw new NotFoundException('Surah not found');
    return surah;
  }

  async create(dto: CreateSurahDto) {
    try {
      return await this.prisma.surah.create({ data: dto });
    } catch {
      throw new ConflictException('Surah with this id already exists');
    }
  }

  async update(id: number, dto: UpdateSurahDto) {
    try {
      return await this.prisma.surah.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Surah not found');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.surah.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Surah not found');
    }
  }
}
