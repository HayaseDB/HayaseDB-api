import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorators
import { ContributionStatus } from '@/module/contributions/entities/contribution.entity';

export class ContributionQueryDto {
  @ApiProperty({
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  limit: number = 20;

  @ApiProperty({
    enum: ContributionStatus,
    required: false,
  })
  @IsOptional()
  status?: ContributionStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  animeId?: string;
}
