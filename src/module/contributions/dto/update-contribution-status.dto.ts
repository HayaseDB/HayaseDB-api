import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContributionStatusDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: null,
  })
  comment?: string;
}
