import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateAyahDto {
  @ApiProperty()
  @IsInt()
  surahId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  number: number;

  @ApiProperty({ example: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' })
  @IsString()
  textArabic: string;
}
