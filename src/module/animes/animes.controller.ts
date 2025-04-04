import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { AnimesService } from './animes.service';
import { CreateAnimeDto } from '@/module/animes/dto/create-anime.dto';
import { UpdateAnimeDto } from '@/module/animes/dto/update-anime.dto';

@Controller('animes')
export class AnimesController {
	constructor(private readonly animesService: AnimesService) {}

	@Post()
	create(@Body() createAnimeDto: CreateAnimeDto) {
		return this.animesService.create(createAnimeDto);
	}

	@Get()
	findAll() {
		return this.animesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.animesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateAnimeDto: UpdateAnimeDto) {
		return this.animesService.update(id, updateAnimeDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.animesService.remove(id);
	}
}
