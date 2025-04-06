import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAnimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  episodes: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  releaseDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  studio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  bannerImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  coverImage?: string;
}
