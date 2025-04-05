import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionStatus } from './entities/contribution.entity';
import { Auth, GetUser } from '@/module/auth/auth.decorator';
import { User } from '@/module/users/entities/user.entity';
import { UpdateContributionStatusDto } from './dto/update-contribution-status.dto';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateContributionDto } from '@/module/contributions/dto/create-contribution.dto';
import { EditContributionDto } from '@/module/contributions/dto/edit-contribution.dto';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionService: ContributionsService) {}

  @Post()
  @Auth('User')
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
  @Auth('User')
  async suggestEditToAnime(
    @Param('animeId') animeId: string,
    @Body() editContributionDto: EditContributionDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.suggestEditToAnime(
      animeId,
      editContributionDto,
      user.id,
    );
  }

  @Patch(':contributionId/:status')
  @Auth('Moderator')
  @ApiParam({
    name: 'status',
    enum: ContributionStatus,
  })
  async updateContributionStatus(
    @Param('contributionId') contributionId: string,
    @Param('status') status: ContributionStatus,
    @Body() updateContributionStatusDto: UpdateContributionStatusDto,
    @GetUser() moderator: User,
  ) {
    if (!Object.values(ContributionStatus).includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return await this.contributionService.updateContributionStatus(
      contributionId,
      status,
      moderator.id,
      updateContributionStatusDto?.comment,
    );
  }

  @Get()
  @Auth('Moderator')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'animeId', required: false })
  async findContributions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: ContributionStatus,
    @Query('userId') userId?: string,
    @Query('animeId') animeId?: string,
  ) {
    return await this.contributionService.findContributions({
      page,
      limit,
      status,
      userId,
      animeId,
    });
  }

  @Get(':contributionId')
  @Auth('Moderator')
  async getContributionById(@Param('contributionId') contributionId: string) {
    const contribution =
      await this.contributionService.getContributionById(contributionId);
    if (!contribution) {
      throw new NotFoundException(
        `Contribution with ID ${contributionId} not found`,
      );
    }
    return contribution;
  }
}
