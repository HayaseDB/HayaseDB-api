import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from '@/config/database.config';
import appConfig from '@/config/app.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [databaseConfig, appConfig],
      cache: true,
      envFilePath: 'stack.env',
    }),
  ],
})
export class ConfigModule {}
