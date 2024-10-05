import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @IsEmail()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
