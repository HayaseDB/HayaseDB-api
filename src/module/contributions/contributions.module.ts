import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from '@/module/contributions/entities/contribution.entity';
import { Anime } from '@/module/animes/entities/anime.entity';
import { User } from '@/module/users/entities/user.entity';
import { EnrichmentModule } from '@/module/enrichment/enrichment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contribution, Anime, User]),
    EnrichmentModule,
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
})
export class ContributionsModule {}
