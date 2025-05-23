import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnimesService } from './animes.service';
import { CreateAnimeDto } from '@/module/animes/dto/create-anime.dto';
import { UpdateAnimeDto } from '@/module/animes/dto/update-anime.dto';
import { Auth } from '@/module/auth/decorator/auth.decorator';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FilterAnimeDto } from '@/module/animes/dto/filter-anime.dto';
import { KeyAuth } from '@/module/auth/decorator/key.decorator';

@Controller('animes')
export class AnimesController {
  constructor(private readonly animesService: AnimesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new anime',
    description: 'Allows an admin to create a new anime record.',
  })
  @Auth('Admin')
  create(@Body() createAnimeDto: CreateAnimeDto) {
    return this.animesService.create(createAnimeDto);
  }

  @Post('search')
  @ApiOperation({
    summary: 'Search and filter animes',
    description:
      'Performs a search with filters, pagination, and sorting on anime records.',
  })
  @HttpCode(HttpStatus.OK)
  @KeyAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records per page',
    type: Number,
    default: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by',
    enum: [
      'title',
      'genres',
      'releaseDate',
      'studio',
      'status',
      'type',
      'createdAt',
    ],
    default: 'releaseDate',
  })
  @ApiQuery({
    name: 'caseSensitive',
    required: false,
    description:
      'Whether to perform a case-sensitive search. Default is false (case-insensitive).',
    type: Boolean,
    example: false,
  })
  @ApiBody({
    required: false,
    type: FilterAnimeDto,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  async findAll(
    @Body() filters: FilterAnimeDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('caseSensitive') caseSensitive: boolean = false,
  ) {
    return this.animesService.findAll({
      filters,
      page,
      limit,
      sortBy,
      sortOrder,
      caseSensitive,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an anime by ID',
    description:
      'Retrieves detailed information about a specific anime using its ID.',
  })
  @KeyAuth()
  findOne(@Param('id') id: string) {
    return this.animesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an anime by ID',
    description: 'Allows an admin to update an existing anime record by ID.',
  })
  @Auth('Admin')
  update(@Param('id') id: string, @Body() updateAnimeDto: UpdateAnimeDto) {
    return this.animesService.update(id, updateAnimeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an anime by ID',
    description: 'Allows an admin to delete an anime record by ID.',
  })
  @Auth('Admin')
  remove(@Param('id') id: string) {
    return this.animesService.remove(id);
  }
}
