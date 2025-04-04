import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { UsersModule } from '@/module/users/users.module';
import { AuthModule } from '@/module/auth/auth.module';
import { AnimesModule } from './module/animes/animes.module';
import { ContributionModule } from '@/module/contributions/contribution.module';
import { AppController } from './app.controller';

@Module({
	imports: [
		ConfigModule,
		DatabaseModule,
		UsersModule,
		AuthModule,
		AnimesModule,
		ContributionModule,
	],
	controllers: [AppController],
})
export class AppModule {}
