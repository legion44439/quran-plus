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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AyahsService } from './ayahs.service';
import { CreateAyahDto } from './dto/create-ayah.dto';
import { UpdateAyahDto } from './dto/update-ayah.dto';

/**
 * CRUD айатов: GET публичный; запись — moderator|admin|superadmin.
 */
@ApiTags('ayahs')
@Controller('ayahs')
export class AyahsController {
  constructor(private ayahs: AyahsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'surahId', required: false, type: Number })
  @ApiOperation({ summary: 'List ayahs (public)' })
  findAll(@Query('surahId') surahId?: string) {
    return this.ayahs.findAll(surahId ? parseInt(surahId, 10) : undefined);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ayahs.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  create(@Body() dto: CreateAyahDto) {
    return this.ayahs.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(@Param('id') id: string, @Body() dto: UpdateAyahDto) {
    return this.ayahs.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id') id: string) {
    return this.ayahs.remove(id);
  }
}
