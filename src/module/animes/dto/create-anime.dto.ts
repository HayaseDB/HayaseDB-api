import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnimeDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	genre: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	episodes: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsDate()
	releaseDate: Date;

	@ApiProperty()
	@IsOptional()
	@IsString()
	synopsis?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	studio?: string;
}
