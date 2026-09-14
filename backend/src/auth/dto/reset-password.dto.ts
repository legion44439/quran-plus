import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

/**
 * Те же правила пароля, что при регистрации — иначе после сброса можно поставить слабый.
 */
export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token from forgot-password flow' })
  @IsString()
  @MinLength(1)
  token: string;

  @ApiProperty({
    example: 'Password1',
    description: 'Min 8 chars, at least one letter and one number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  newPassword: string;
}
