import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAyahDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textArabic?: string;
}
