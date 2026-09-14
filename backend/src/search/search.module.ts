import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/** Модуль публичного поиска — единая точка для мобильного GET /api/search. */
@Module({
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
