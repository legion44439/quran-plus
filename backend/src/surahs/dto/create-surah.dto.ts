import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSurahDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ example: 'الفاتحة' })
  @IsString()
  nameArabic: string;

  @ApiProperty({ example: 'Al-Fatihah' })
  @IsString()
  nameLatin: string;

  @ApiPropertyOptional({ example: 'The Opening' })
  @IsOptional()
  @IsString()
  nameEnglish?: string;

  @ApiPropertyOptional({ example: 'Meccan' })
  @IsOptional()
  @IsString()
  revelationType?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  ayahCount?: number;
}
