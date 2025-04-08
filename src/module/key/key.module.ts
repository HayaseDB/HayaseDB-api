import { Module } from '@nestjs/common';
import { KeyController } from './key.controller';
import { KeyService } from './key.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Key} from "@/module/key/entities/key.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Key])],
  controllers: [KeyController],
  providers: [KeyService],
  exports: [KeyService]
})
export class KeyModule {}
