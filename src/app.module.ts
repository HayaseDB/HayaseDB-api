import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { UsersModule } from '@/module/users/users.module';
import { AuthModule } from '@/module/auth/auth.module';
import { AnimesModule } from './module/animes/animes.module';
import { ContributionsModule } from '@/module/contributions/contributions.module';
import { AppController } from './app.controller';
import { MailerModule } from './module/mailer/mailer.module';
import { MediaModule } from './module/media/media.module';
import { KeyModule } from '@/module/key/key.module';
import { StatsModule } from './module/stats/stats.module';
import { EnrichmentModule } from './module/enrichment/enrichment.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    AnimesModule,
    ContributionsModule,
    MailerModule,
    MediaModule,
    KeyModule,
    StatsModule,
    EnrichmentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
