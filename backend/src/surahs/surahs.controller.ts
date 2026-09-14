import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSurahDto } from './dto/create-surah.dto';
import { UpdateSurahDto } from './dto/update-surah.dto';
import { SurahsService } from './surahs.service';

/**
 * CRUD сур: GET публичный; запись (POST/PATCH/DELETE) — moderator|admin|superadmin.
 */
@ApiTags('surahs')
@Controller('surahs')
export class SurahsController {
  constructor(private surahs: SurahsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List surahs (public)' })
  findAll() {
    return this.surahs.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get surah with ayahs (public)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.surahs.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  @ApiOperation({ summary: 'Create surah (moderator|admin|superadmin)' })
  create(@Body() dto: CreateSurahDto) {
    return this.surahs.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSurahDto,
  ) {
    return this.surahs.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.surahs.remove(id);
  }
}
