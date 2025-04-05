import { PartialType } from '@nestjs/swagger';
import { UpdateAnimeDto } from '@/module/animes/dto/update-anime.dto';

export class EditContributionDto extends PartialType(UpdateAnimeDto) {}
