import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** ILIKE-поиск по 4 сущностям параллельно; пустой q → пустые массивы (не 400). */
@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string, limit = 20, type?: string) {
    const take = Math.min(Math.max(limit || 20, 1), 50);
    const term = q.trim();
    if (!term) {
      return { surahs: [], ayahs: [], translations: [], reciters: [] };
    }

    const want = (t: string) => !type || type === t;

    const [surahs, ayahs, translations, reciters] = await Promise.all([
      want('surahs')
        ? this.prisma.surah.findMany({
            where: {
              OR: [
                { nameArabic: { contains: term, mode: 'insensitive' } },
                { nameLatin: { contains: term, mode: 'insensitive' } },
                { nameEnglish: { contains: term, mode: 'insensitive' } },
              ],
            },
            take,
            orderBy: { id: 'asc' },
            select: {
              id: true,
              nameArabic: true,
              nameLatin: true,
              nameEnglish: true,
              revelationType: true,
              ayahCount: true,
            },
          })
        : Promise.resolve([]),
      want('ayahs')
        ? this.prisma.ayah.findMany({
            where: {
              textArabic: { contains: term, mode: 'insensitive' },
            },
            take,
            orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
            select: {
              id: true,
              surahId: true,
              number: true,
              textArabic: true,
              surah: {
                select: { nameLatin: true, nameArabic: true },
              },
            },
          })
        : Promise.resolve([]),
      want('translations')
        ? this.prisma.translation.findMany({
            where: {
              text: { contains: term, mode: 'insensitive' },
            },
            take,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              ayahId: true,
              language: true,
              text: true,
              translator: true,
              ayah: {
                select: { surahId: true, number: true },
              },
            },
          })
        : Promise.resolve([]),
      want('reciters')
        ? this.prisma.reciter.findMany({
            where: {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { nameArabic: { contains: term, mode: 'insensitive' } },
              ],
            },
            take,
            orderBy: { name: 'asc' },
            select: {
              id: true,
              name: true,
              nameArabic: true,
              imageUrl: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return { surahs, ayahs, translations, reciters };
  }
}
