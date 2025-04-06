import { Module } from '@nestjs/common';
import { AnimesService } from './animes.service';
import { AnimesController } from './animes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '@/module/animes/entities/anime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Anime])],
  controllers: [AnimesController],
  providers: [AnimesService],
})
export class AnimesModule {}
