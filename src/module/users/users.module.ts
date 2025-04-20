import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/module/users/entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Pfp } from '@/module/users/entities/pfp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Pfp])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
