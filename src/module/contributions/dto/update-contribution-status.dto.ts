import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ContributionStatus } from '@/module/contributions/entities/contribution.entity';

export class UpdateContributionStatusDto {
	@IsEnum(ContributionStatus)
	status: ContributionStatus;

	@IsOptional()
	@IsNumber()
	moderatorId?: string;
}
