import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { AnimesModule } from '@/module/animes/animes.module';
import {UsersModule} from "@/module/users/users.module";
import {KeyModule} from "@/module/key/key.module";
import {MediaModule} from "@/module/media/media.module";

@Module({
  imports: [UsersModule, AnimesModule, KeyModule, MediaModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
