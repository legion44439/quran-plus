import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CommentsService } from './comments.service';

class CreateCommentDto {
  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  targetType: ContentType;

  @ApiProperty()
  @IsString()
  targetId: string;
}

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private comments: CommentsService) {}

  @Public()
  @Get()
  findAll() {
    return this.comments.findAll();
  }

  @Post()
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(
      userId,
      dto.body,
      dto.targetType,
      dto.targetId,
    );
  }
}
