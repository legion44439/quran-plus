import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationsService } from './translations.service';

/**
 * CRUD переводов: GET публичный; запись — moderator|admin|superadmin.
 */
@ApiTags('translations')
@Controller('translations')
export class TranslationsController {
  constructor(private translations: TranslationsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'ayahId', required: false })
  @ApiQuery({ name: 'language', required: false })
  findAll(
    @Query('ayahId') ayahId?: string,
    @Query('language') language?: string,
  ) {
    return this.translations.findAll(ayahId, language);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.translations.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  create(@Body() dto: CreateTranslationDto) {
    return this.translations.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(@Param('id') id: string, @Body() dto: UpdateTranslationDto) {
    return this.translations.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id') id: string) {
    return this.translations.remove(id);
  }
}
