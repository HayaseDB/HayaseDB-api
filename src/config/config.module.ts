import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from '@/config/database.config';
import appConfig from '@/config/app.config';
import { configValidate } from '@/config/config.schema';
import jwtConfig from '@/config/jwt.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: configValidate,
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
      cache: true,
      envFilePath: 'stack.env',
    }),
  ],
})
export class ConfigModule {}
