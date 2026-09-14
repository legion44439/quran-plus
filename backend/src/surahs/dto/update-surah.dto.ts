import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSurahDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameArabic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameLatin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEnglish?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revelationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  ayahCount?: number;
}
