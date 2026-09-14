import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from './users.service';

/**
 * Пользователи: /me для себя; список и смена роли — только superadmin
 * (иначе admin/moderator могли бы эскалировать права).
 */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser('id') userId: string) {
    return this.users.me(userId);
  }

  @Get()
  @Roles(Role.superadmin)
  @ApiOperation({ summary: 'List users (superadmin)' })
  list() {
    return this.users.list();
  }

  /** Назначение роли — только superadmin. */
  @Patch(':id/role')
  @Roles(Role.superadmin)
  @ApiOperation({ summary: 'Update user role (superadmin)' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.users.updateRole(id, dto.role);
  }
}
