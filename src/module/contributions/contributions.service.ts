import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  Contribution,
  ContributionStatus,
} from './entities/contribution.entity';
import { Anime } from '../animes/entities/anime.entity';
import { Role, User } from '../users/entities/user.entity';
import { merge, mergeWith } from 'lodash';
import { EnrichmentService } from '@/module/enrichment/enrichment.service';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
    @InjectRepository(Anime)
    private readonly animeRepository: Repository<Anime>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly enrichmentService: EnrichmentService,
  ) {}

  async create(
    data: Record<string, any>,
    userId: string,
  ): Promise<Contribution> {
    const user = await this.findUserById(userId);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Invalid contribution data format');
    }

    const contribution = this.contributionRepository.create({
      user,
      data,
      status: ContributionStatus.PENDING,
    });
    const savedContribution =
      await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async suggestEdit(
    animeId: string,
    data: Partial<Anime>,
    userId: string,
  ): Promise<Contribution> {
    const user = await this.findUserById(userId);
    const anime = await this.findAnimeById(animeId);
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const updatedAnimeData = mergeWith(
      {},
      anime,
      data,
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) return srcValue;
      },
    );

    const contribution = this.contributionRepository.create({
      anime,
      user,
      data: updatedAnimeData,
      status: ContributionStatus.PENDING,
    });
    const savedContribution =
      await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async update(
    contributionId: string,
    data: Record<string, any>,
    user: User,
  ): Promise<Contribution> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const contribution = await this.findContributionById(contributionId);

    if (
      contribution.user.id !== user.id &&
      ![Role.Admin, Role.Moderator].includes(user.role)
    ) {
      throw new ForbiddenException(
        'You are not allowed to update this contribution',
      );
    }

    contribution.data = merge({}, contribution.data, data);
    contribution.status = ContributionStatus.PENDING;
    await this.contributionRepository.save(contribution);

    return this.findById(contribution.id);
  }

  async updateStatus(
    contributionId: string,
    status: ContributionStatus,
    moderatorId: string,
    rejectionComment?: string,
  ): Promise<
    Contribution | { id: string; affected?: number; contribution: Contribution }
  > {
    const contribution = await this.findContributionById(contributionId);
    const moderator = await this.findUserById(moderatorId);

    if (![Role.Admin, Role.Moderator].includes(moderator.role)) {
      throw new ForbiddenException('User does not have moderator permissions');
    }

    contribution.status = status;
    contribution.moderator = moderator;

    if (status === ContributionStatus.REJECTED) {
      if (!rejectionComment) {
        throw new BadRequestException('Rejection comment is required');
      }
      contribution.rejectionComment = rejectionComment;
      return this.contributionRepository.save(contribution);
    }

    if (status === ContributionStatus.ACCEPTED) {
      await this.applyAcceptedContribution(contribution);
    }

    const savedContribution =
      await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    status?: ContributionStatus;
    userId?: string;
    animeId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    moderatorId?: string;
  }): Promise<{
    items: Contribution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      animeId,
      startDate,
      endDate,
      sortBy,
      sortDirection = 'DESC',
      moderatorId,
    } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (userId) where.user = { id: userId };
    if (animeId) where.anime = { id: animeId };
    if (moderatorId) where.moderator = { id: moderatorId };
    if (startDate) where.createdAt = MoreThanOrEqual(new Date(startDate));
    if (endDate) where.createdAt = LessThanOrEqual(new Date(endDate));

    const order = {};
    if (sortBy) {
      order[sortBy] = sortDirection.toUpperCase();
    } else {
      order['createdAt'] = 'DESC';
    }

    const [items, total] = await this.contributionRepository.findAndCount({
      where,
      relations: ['moderator', 'user', 'anime'],
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(contributionId: string, user?: User): Promise<any> {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['anime', 'user', 'moderator'],
    });

    const isPrivileged =
      user && [Role.Admin, Role.Moderator].includes(user.role);
    const isOwner = user && contribution?.user?.id === user.id;

    if (!contribution || (user && !isOwner && !isPrivileged)) {
      throw new NotFoundException('Contribution not found');
    }

    const result: any = { ...contribution };

    if (contribution.data) {
      result.data = this.enrichmentService.enrichFields(
        contribution.data,
        Anime,
      );
    }

    if (contribution.anime) {
      result.anime = this.enrichmentService.enrichFields(
        contribution.anime,
        Anime,
      );
    }

    if (contribution.originalAnime) {
      result.originalAnime = this.enrichmentService.enrichFields(
          contribution.originalAnime,
          Anime,
      );
    }

    return result;
  }

  async delete(contributionId: string, user: User): Promise<Contribution> {
    const contribution = await this.findContributionById(contributionId);

    if (
      contribution.user.id !== user.id &&
      ![Role.Admin, Role.Moderator].includes(user.role)
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this contribution',
      );
    }

    return this.contributionRepository.remove(contribution);
  }

  getSchema(): Array<Record<string, any>> {
    return this.enrichmentService.getEntitySchema(Anime);
  }

  private async findContributionById(
    contributionId: string,
  ): Promise<Contribution> {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  private async findAnimeById(animeId: string): Promise<Anime> {
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
    });
    if (!anime) {
      throw new BadRequestException('Anime not found');
    }
    return anime;
  }
  private async applyAcceptedContribution(
    contribution: Contribution,
  ): Promise<
    Contribution | { id: string; affected?: number; contribution: Contribution }
  > {
    if (!contribution.anime) {
      const newAnime = this.animeRepository.create(contribution.data);
      contribution.anime = await this.animeRepository.save(newAnime);
    } else {
      const animeUpdateData = contribution.data;
      delete animeUpdateData.createdAt;

      const result = await this.animeRepository.update(
        contribution.anime.id,
        animeUpdateData,
      );
      return { id: contribution.id, affected: result.affected, contribution };
    }

    return this.contributionRepository.save(contribution);
  }
}
