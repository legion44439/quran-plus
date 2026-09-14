import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.category.findUnique({
      where: { id },
      include: { videos: true },
    });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Category not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Category not found');
    }
  }
}
