import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ContributionStatus } from '@/module/contributions/entities/contribution.entity';
import { Auth, GetUser } from '@/module/auth/auth.decorator';
import { User } from '@/module/users/entities/user.entity';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionService: ContributionsService) {}

  @Post()
  @Auth()
  async createContribution(
    @Body() createContributionDto: CreateContributionDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.createContribution(
      createContributionDto,
      user.id,
    );
  }

  @Post(':animeId')
  async createOrUpdateContribution(
    @Param('animeId') animeId: string,
    @Body() createContributionDto: CreateContributionDto,
  ) {
    return await this.contributionService.createOrUpdateContribution(
      animeId,
      createContributionDto,
    );
  }

  @Patch(':animeId')
  async editContributionRequest(
    @Param('animeId') animeId: string,
    @Body() createContributionDto: CreateContributionDto,
  ) {
    return await this.contributionService.editContributionRequest(
      animeId,
      createContributionDto,
    );
  }

  @Patch(':animeId/decline')
  @Auth('Admin')
  async declineContribution(@Param('animeId') animeId: string) {
    return await this.contributionService.updateContributionStatus(
      animeId,
      ContributionStatus.REJECTED,
    );
  }

  @Patch(':animeId/accept')
  @Auth('Admin')
  async acceptContribution(@Param('animeId') animeId: string) {
    return await this.contributionService.updateContributionStatus(
      animeId,
      ContributionStatus.APPROVED,
    );
  }

  @Patch(':animeId/pending')
  @Auth('Admin')
  async setContributionPending(@Param('animeId') animeId: string) {
    return await this.contributionService.updateContributionStatus(
      animeId,
      ContributionStatus.PENDING,
    );
  }

  @Get()
  async findPendingContributions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.contributionService.findPendingContributions(page, limit);
  }

  @Get(':contributionId')
  async getContributionById(@Param('contributionId') contributionId: string) {
    return await this.contributionService.getContributionById(contributionId);
  }
}
