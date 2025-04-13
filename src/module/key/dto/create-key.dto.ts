import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateKeyDto {
  @ApiProperty()
  @IsString()
  name?: string;
}
