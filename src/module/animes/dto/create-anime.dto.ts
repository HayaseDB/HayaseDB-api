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
import { IsYouTubeUrl } from '@/module/animes/validator/url.validator';

export class CreateAnimeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releaseDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studio?: string;

  @ApiProperty({ required: false, enum: AnimeStatus })
  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @ApiProperty({ required: false, enum: AnimeType })
  @IsOptional()
  @IsEnum(AnimeType)
  type?: AnimeType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsYouTubeUrl({ message: 'Trailer URL must be a valid YouTube link' })
  trailer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  bannerImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  coverImage?: string;
}
