import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * Password rules: min 8 characters, at least one letter and one number.
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password1',
    description: 'Min 8 chars, at least one letter and one number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({ example: 'Aisha' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
