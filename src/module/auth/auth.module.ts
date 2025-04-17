import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/module/auth/strategy/jwt.strategy';
import { MailerModule } from '@/module/mailer/mailer.module';
import { KeyModule } from '@/module/key/key.module';
import { KeyStrategy } from '@/module/auth/strategy/key.strategy';
import {minutes, ThrottlerModule} from "@nestjs/throttler";

@Module({
  imports: [
    KeyModule,
    UsersModule,
    MailerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: minutes(1),
        limit: 100,
      }
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KeyStrategy, UsersModule],
  exports: [AuthService],
})
export class AuthModule {}
