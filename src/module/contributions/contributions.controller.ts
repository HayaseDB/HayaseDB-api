import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
  BadRequestException, Delete, HttpStatus, HttpCode, Put,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionStatus } from './entities/contribution.entity';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';
import { User } from '@/module/users/entities/user.entity';
import { UpdateContributionStatusDto } from './dto/update-contribution-status.dto';
import { ApiParam } from '@nestjs/swagger';
import { CreateContributionDto } from '@/module/contributions/dto/create-contribution.dto';
import { EditContributionDto } from '@/module/contributions/dto/edit-contribution.dto';
import { ContributionQueryDto } from '@/module/contributions/dto/query.dto';
import {ContributionMeQueryDto} from "@/module/contributions/dto/query-me.dto";
import {UpdateContributionDto} from "@/module/contributions/dto/update-contribution.dto";

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

  @Patch(':contributionId')
  @Auth('User')
  async updateContribution(
      @Param('contributionId') contributionId: string,
      @Body() updateContributionDto: UpdateContributionDto,
      @GetUser() user: User,
  ) {
    return await this.contributionService.updateContribution(
        contributionId,
        updateContributionDto,
        user,
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
  async findContributions(@Query() query: ContributionQueryDto) {
    return await this.contributionService.findContributions(query);
  }

  @Get('me')
  @Auth('User')
  async findContributionsMe(@Query() query: ContributionMeQueryDto, @GetUser() user: User) {
    return await this.contributionService.findContributions({
      ...query,
      userId: user.id,
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


  @Delete(':contributionId')
  @Auth('User')
  async deleteContributionById(@Param('contributionId') contributionId: string, @GetUser() user: User) {
    await this.contributionService.deleteContributionById(contributionId, user);
    return {
      success: true,
      message: `Contribution was successfully deleted`,
    };
  }
}
