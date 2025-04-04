import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from '@/module/contributions/entities/contribution.entity';
import { Anime } from '@/module/animes/entities/anime.entity';
import { User } from '@/module/users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Contribution, Anime, User])],
	controllers: [ContributionController],
	providers: [ContributionService],
})
export class ContributionModule {}
