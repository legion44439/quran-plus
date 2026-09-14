import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Запрос presigned PUT в R2.
 * folder — логическая «папка» в бакете (по умолчанию uploads); имя бакета только из env.
 */
export class PresignUploadDto {
  @ApiProperty({ example: 'audio/mpeg', description: 'MIME-тип загружаемого файла' })
  @IsString()
  @MaxLength(128)
  @Matches(
    /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_+.]+\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_+.]+$/,
    { message: 'contentType must be a valid MIME type' },
  )
  contentType: string;

  @ApiPropertyOptional({
    example: 'audio',
    description: 'Папка/префикс ключа (без слэшей). По умолчанию uploads',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'folder must be alphanumeric, underscore or hyphen only',
  })
  folder?: string;

  @ApiPropertyOptional({
    example: 'surah-1.mp3',
    description: 'Исходное имя файла; в key попадёт как {uuid}-{safeFilename}',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;
}
