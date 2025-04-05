import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MediaRole } from '@/module/media/entities/media.entity';

export class CreateMediaDto {

  @ApiProperty({
    enum: MediaRole,
    required: true,
  })
  @IsString()
  role: MediaRole;
}
