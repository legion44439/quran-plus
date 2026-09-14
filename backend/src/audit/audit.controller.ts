import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @Roles(Role.superadmin)
  findAll(@Query('take') take?: string) {
    return this.audit.findAll(take ? parseInt(take, 10) : 100);
  }
}
