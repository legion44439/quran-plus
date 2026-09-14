import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateReciterDto } from './dto/create-reciter.dto';
import { UpdateReciterDto } from './dto/update-reciter.dto';
import { RecitersService } from './reciters.service';

/**
 * CRUD чтецов: GET публичный; запись — moderator|admin|superadmin.
 */
@ApiTags('reciters')
@Controller('reciters')
export class RecitersController {
  constructor(private reciters: RecitersService) {}

  @Public()
  @Get()
  findAll() {
    return this.reciters.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reciters.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  create(@Body() dto: CreateReciterDto) {
    return this.reciters.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(@Param('id') id: string, @Body() dto: UpdateReciterDto) {
    return this.reciters.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id') id: string) {
    return this.reciters.remove(id);
  }
}
