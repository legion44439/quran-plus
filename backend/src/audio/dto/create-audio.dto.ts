import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAudioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'https://cdn.example.com/audio/1.mp3' })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiProperty()
  @IsUUID()
  reciterId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  surahId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ayahId?: string;
}
