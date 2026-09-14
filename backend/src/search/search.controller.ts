import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Public } from '../common/decorators/public.decorator';
import { SearchService } from './search.service';

class SearchQueryDto {
  @ApiProperty({ description: 'Search query string', example: 'fatihah' })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Optional group filter: surahs | ayahs | translations | reciters',
    example: 'surahs',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

/**
 * GET /api/search — агрегированный поиск без auth (гость тоже ищет в приложении).
 * type сужает группу: surahs | ayahs | translations | reciters.
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private search: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search surahs, ayahs, translations, and reciters (public)',
  })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false })
  find(@Query() query: SearchQueryDto) {
    return this.search.search(query.q || '', query.limit ?? 20, query.type);
  }
}
