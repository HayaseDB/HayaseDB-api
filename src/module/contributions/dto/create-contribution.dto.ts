import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContributionDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	animeId: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	userId: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsObject()
	changeData: Record<string, any>;
}
