import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class updateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The username of the user', required: false })
  username?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ description: 'The email of the user', required: false })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The password of the user', required: false })
  password?: string;
}
