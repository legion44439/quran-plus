import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GroupsService } from './groups.service';

class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  findAll() {
    return this.groups.findAll();
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGroupDto) {
    return this.groups.create(userId, dto.name, dto.description);
  }

  @Get(':id/messages')
  listMessages(@Param('id') id: string) {
    return this.groups.listMessages(id);
  }
}
