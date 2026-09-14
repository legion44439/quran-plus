import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTranslationDto {
  @ApiProperty()
  @IsUUID()
  ayahId: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'Sahih International' })
  @IsOptional()
  @IsString()
  translator?: string;
}
