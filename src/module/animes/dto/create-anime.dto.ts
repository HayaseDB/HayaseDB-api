import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsArray,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AnimeStatus, AnimeType } from '@/module/animes/entities/anime.entity';

export class CreateAnimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  genres?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releaseDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mainDirector?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  musicComposer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  officialWebsiteUrl?: string;

  // Enums

  @ApiProperty({
    required: false,
    enum: AnimeStatus,
  })
  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @ApiProperty({
    required: false,
    enum: AnimeType,
  })
  @IsOptional()
  @IsEnum(AnimeType)
  type?: AnimeType;

  // Media Fields

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  bannerImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  coverImage?: string;
}
