import { Controller, Post, Body, Patch, Get, Param } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionStatusDto } from './dto/update-contribution-status.dto';

@Controller('contributions')
export class ContributionController {
	constructor(private readonly contributionService: ContributionService) {}

	@Post()
	create(@Body() createDto: CreateContributionDto) {
		return this.contributionService.create(createDto);
	}

	@Get('pending')
	findPendingRequests() {
		return this.contributionService.findPendingRequests();
	}

	@Patch(':id')
	updateStatus(
		@Param('id') id: string,
		@Body() updateDto: UpdateContributionStatusDto,
	) {
		return this.contributionService.updateStatus(id, updateDto);
	}
}
