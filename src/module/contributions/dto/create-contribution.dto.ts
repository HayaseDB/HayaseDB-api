import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateContributionDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsArray()
	genres?: string[];

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	releaseDate?: string;
}
