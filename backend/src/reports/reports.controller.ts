import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { ContentType, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';

class CreateReportDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  targetType: ContentType;

  @ApiProperty()
  @IsString()
  targetId: string;
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get()
  @Roles(Role.moderator, Role.admin, Role.superadmin)
  findAll() {
    return this.reports.findAll();
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReportDto) {
    return this.reports.create(
      userId,
      dto.reason,
      dto.targetType,
      dto.targetId,
      dto.details,
    );
  }
}
