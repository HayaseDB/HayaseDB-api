import {IsDate, IsOptional, IsString, IsUUID} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterAnimeDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Naruto',
    required: false,
  })
  title?: string;

  @IsOptional()
  @ApiProperty({
    example: ['Action'],
    required: false,
  })
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    example: '2025-04-06T12:27:53.774Z',
    required: false,
  })
  releaseDate?: string;


  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
  })
  id?: string;
}
