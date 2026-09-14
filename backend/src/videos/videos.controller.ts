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
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private videos: VideosService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.videos.findAll(categoryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videos.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  create(@Body() dto: CreateVideoDto) {
    return this.videos.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    return this.videos.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  remove(@Param('id') id: string) {
    return this.videos.remove(id);
  }
}
