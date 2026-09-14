import { Module } from '@nestjs/common';
import { SurahsController } from './surahs.controller';
import { SurahsService } from './surahs.service';

@Module({
  controllers: [SurahsController],
  providers: [SurahsService],
})
export class SurahsModule {}
