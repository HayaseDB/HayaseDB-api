import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@ApiProperty()
	email: string;

	@ApiProperty({ example: 'StrongPass123' })
	@IsString()
	@MinLength(6)
	password: string;
}
