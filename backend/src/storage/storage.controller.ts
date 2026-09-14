import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { StorageService } from './storage.service';

/**
 * Медиа-загрузки в Cloudflare R2.
 * Запись (presign) — moderator|admin|superadmin, как у audio/video CRUD.
 */
@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('presign')
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  @ApiOperation({
    summary: 'Presigned PUT URL для загрузки в R2',
    description:
      'Клиент получает uploadUrl, кладёт файл PUT-ом с тем же Content-Type, затем сохраняет publicUrl/key в сущности (AudioTrack.url и т.п.). Bucket берётся из R2_BUCKET.',
  })
  presignUpload(@Body() dto: PresignUploadDto) {
    return this.storage.createUploadPresign(dto);
  }
}
