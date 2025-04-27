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
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionStatus } from './entities/contribution.entity';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';
import { User } from '@/module/users/entities/user.entity';
import { UpdateContributionStatusDto } from './dto/update-contribution-status.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateContributionDto } from '@/module/contributions/dto/create-contribution.dto';
import { EditContributionDto } from '@/module/contributions/dto/edit-contribution.dto';
import { ContributionQueryDto } from '@/module/contributions/dto/query.dto';
import { ContributionMeQueryDto } from '@/module/contributions/dto/query-me.dto';
import { UpdateContributionDto } from '@/module/contributions/dto/update-contribution.dto';

@ApiTags('Contributions')
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionService: ContributionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new contribution',
    description:
      'Allows a user to create a new contribution suggestion for an anime.',
  })
  @Auth('User')
  async createContribution(
    @Body() createContributionDto: CreateContributionDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.create(
      createContributionDto,
      user.id,
    );
  }

  @Post(':animeId')
  @ApiOperation({
    summary: 'Suggest an edit to an anime',
    description:
      'Allows a user to suggest an edit to an existing anime by submitting a contribution.',
  })
  @Auth('User')
  async suggestEditToAnime(
    @Param('animeId') animeId: string,
    @Body() editContributionDto: EditContributionDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.suggestEdit(
      animeId,
      editContributionDto,
      user.id,
    );
  }

  @Patch(':contributionId')
  @ApiOperation({
    summary: 'Update a contribution',
    description: 'Allows a user to update their pending contribution.',
  })
  @Auth('User')
  async updateContribution(
    @Param('contributionId') contributionId: string,
    @Body() updateContributionDto: UpdateContributionDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.update(
      contributionId,
      updateContributionDto,
      user,
    );
  }

  @Patch(':contributionId/:status')
  @ApiOperation({
    summary: 'Update the status of a contribution',
    description:
      "Allows a moderator to approve, reject, or update the status of a user's contribution.",
  })
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

    return await this.contributionService.updateStatus(
      contributionId,
      status,
      moderator.id,
      updateContributionStatusDto?.comment,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all contributions',
    description:
      'Allows a moderator to retrieve a list of all contributions with optional filters.',
  })
  @Auth('Moderator')
  async findContributions(@Query() query: ContributionQueryDto) {
    return await this.contributionService.findAll(query);
  }

  @Get('me')
  @ApiOperation({
    summary: "Get current user's contributions",
    description: 'Retrieves all contributions made by the authenticated user.',
  })
  @Auth('User')
  async findContributionsMe(
    @Query() query: ContributionMeQueryDto,
    @GetUser() user: User,
  ) {
    return await this.contributionService.findAll({
      ...query,
      userId: user.id,
    });
  }

  @Get('/schema')
  @ApiOperation({
    summary: 'Get contribution schema',
    description: 'Returns the JSON schema structure used for contributions.',
  })
  getSchema() {
    return this.contributionService.getSchema();
  }

  @Get(':contributionId')
  @ApiOperation({
    summary: 'Get a contribution by ID',
    description:
      'Retrieves a specific contribution by its ID for the authenticated user.',
  })
  @Auth('User')
  async getContributionById(
    @Param(
      'contributionId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Invalid contribution ID format.'),
      }),
    )
    contributionId: string,
    @GetUser() user: User,
  ) {
    const contribution = await this.contributionService.findById(
      contributionId,
      user,
    );
    if (!contribution) {
      throw new NotFoundException(
        `Contribution with ID ${contributionId} not found`,
      );
    }
    return contribution;
  }

  @Delete(':contributionId')
  @ApiOperation({
    summary: 'Delete a contribution',
    description: 'Allows a user to delete their own contribution by ID.',
  })
  @Auth('User')
  async deleteContributionById(
    @Param('contributionId') contributionId: string,
    @GetUser() user: User,
  ) {
    await this.contributionService.delete(contributionId, user);
    return {
      success: true,
      message: `Contribution was successfully deleted`,
    };
  }
}
