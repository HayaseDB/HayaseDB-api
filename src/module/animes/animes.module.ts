import { Module } from '@nestjs/common';
import { AnimesService } from './animes.service';
import { AnimesController } from './animes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from '@/module/animes/entities/anime.entity';
import { EnrichmentModule } from '@/module/enrichment/enrichment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Anime]), EnrichmentModule],
  controllers: [AnimesController],
  providers: [AnimesService],
  exports: [AnimesService],
})
export class AnimesModule {}
