import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnimeDto } from '@/module/animes/dto/create-anime.dto';
import { Anime } from '@/module/animes/entities/anime.entity';
import { UpdateAnimeDto } from '@/module/animes/dto/update-anime.dto';

@Injectable()
export class AnimesService {
  constructor(
    @InjectRepository(Anime)
    private animesRepository: Repository<Anime>,
  ) {}

  create(createAnimeDto: CreateAnimeDto) {
    const anime = this.animesRepository.create(createAnimeDto);
    return this.animesRepository.save(anime);
  }

  findAll() {
    return this.animesRepository.find();
  }

  findOne(id: string) {
    return this.animesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAnimeDto: UpdateAnimeDto) {
    await this.animesRepository.update(id, updateAnimeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.animesRepository.delete(id);
    return { deleted: true };
  }
}
