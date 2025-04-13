import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Username of the user',
    minLength: 3,
    maxLength: 20,
    example: 'hayase',
  })
  @IsString()
  @IsOptional()
  @Length(3, 20)
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'hayase@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Password for the user account',
    minLength: 6,
    maxLength: 20,
    example: 'SecurePass123',
  })
  @IsString()
  @IsOptional()
  @Length(6, 20)
  password?: string;
}
