import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

class CreateFavoriteDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  targetType: ContentType;

  @ApiProperty()
  @IsString()
  targetId: string;
}

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  findMine(@CurrentUser('id') userId: string) {
    return this.favorites.findMine(userId);
  }

  @Post()
  add(@CurrentUser('id') userId: string, @Body() dto: CreateFavoriteDto) {
    return this.favorites.add(userId, dto.targetType, dto.targetId);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.favorites.remove(userId, id);
  }
}
