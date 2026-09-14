import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateAudioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reciterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  surahId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ayahId?: string;
}
