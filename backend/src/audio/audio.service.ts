import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';

@Injectable()
export class AudioService {
  constructor(private prisma: PrismaService) {}

  findAll(reciterId?: string, surahId?: number) {
    return this.prisma.audioTrack.findMany({
      where: {
        ...(reciterId ? { reciterId } : {}),
        ...(surahId ? { surahId } : {}),
      },
      include: { reciter: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.audioTrack.findUnique({
      where: { id },
      include: { reciter: true, surah: true, ayah: true },
    });
    if (!row) throw new NotFoundException('Audio track not found');
    return row;
  }

  create(dto: CreateAudioDto) {
    return this.prisma.audioTrack.create({ data: dto });
  }

  async update(id: string, dto: UpdateAudioDto) {
    try {
      return await this.prisma.audioTrack.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Audio track not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.audioTrack.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Audio track not found');
    }
  }
}
