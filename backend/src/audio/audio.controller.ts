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
import { AudioService } from './audio.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';

/**
 * CRUD аудио-треков: GET публичный; запись — moderator|admin|superadmin.
 */
@ApiTags('audio')
@Controller('audio')
export class AudioController {
  constructor(private audio: AudioService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'reciterId', required: false })
  @ApiQuery({ name: 'surahId', required: false })
  findAll(
    @Query('reciterId') reciterId?: string,
    @Query('surahId') surahId?: string,
  ) {
    return this.audio.findAll(
      reciterId,
      surahId ? parseInt(surahId, 10) : undefined,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.audio.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  create(@Body() dto: CreateAudioDto) {
    return this.audio.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(@Param('id') id: string, @Body() dto: UpdateAudioDto) {
    return this.audio.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id') id: string) {
    return this.audio.remove(id);
  }
}
