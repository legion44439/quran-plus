import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tafsir' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tafsir' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
