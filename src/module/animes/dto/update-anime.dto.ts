import { PartialType } from '@nestjs/swagger';
import { CreateAnimeDto } from '@/module/animes/dto/create-anime.dto';
export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {}
