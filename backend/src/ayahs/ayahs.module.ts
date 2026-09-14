import { Module } from '@nestjs/common';
import { AyahsController } from './ayahs.controller';
import { AyahsService } from './ayahs.service';

@Module({
  controllers: [AyahsController],
  providers: [AyahsService],
})
export class AyahsModule {}
