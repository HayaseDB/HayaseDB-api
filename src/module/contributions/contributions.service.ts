import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contribution,
  ContributionStatus,
} from './entities/contribution.entity';
import { Anime } from '../animes/entities/anime.entity';
import { Role, User } from '../users/entities/user.entity';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createContribution(data: any, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const contribution = this.contributionRepository.create({
      user,
      changeData: data,
      status: ContributionStatus.PENDING,
    });

    return await this.contributionRepository.save(contribution);
  }

  async suggestEditToAnime(
    animeId: string,
    data: Partial<Anime>,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
    });
    if (!anime) {
      throw new BadRequestException('Anime not found');
    }

    const existingContribution = await this.contributionRepository.findOne({
      where: {
        anime: { id: animeId },
        user: { id: userId },
        status: ContributionStatus.PENDING,
      },
    });

    if (existingContribution) {
      const existingChangeData = existingContribution.changeData;

      const conflictingFields = Object.keys(data).filter(
        (key) => existingChangeData[key] !== data[key],
      );

      if (conflictingFields.length > 0) {
        throw new BadRequestException(
          `Conflicting fields detected: ${conflictingFields.join(', ')}`,
        );
      }
    }

    const changeData: Anime = Object.assign({}, anime);

    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(anime, key)) {
        changeData[key] = data[key];
      }
    }

    const contribution = this.contributionRepository.create({
      anime,
      user,
      changeData,
      status: ContributionStatus.PENDING,
    });

    const savedContribution =
      await this.contributionRepository.save(contribution);

    return this.contributionRepository.findOne({
      where: { id: savedContribution.id },
    });
  }
  async updateContribution(
    contributionId: string,
    data: Record<string, any>,
    user: User,
  ) {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['user'],
    });

    if (!contribution) {
      throw new BadRequestException('Contribution not found');
    }

    if (
      contribution.user.id !== user.id &&
      user.role !== Role.Admin &&
      user.role !== Role.Moderator
    ) {
      throw new ForbiddenException(
        'You are not allowed to update this contribution',
      );
    }

    const changeData = { ...(contribution.changeData as Record<string, any>) };

    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(contribution.changeData, key)) {
        changeData[key] = data[key];
      }
    }

    contribution.changeData = changeData;
    contribution.status = ContributionStatus.PENDING;

    return await this.contributionRepository.save(contribution);
  }

  async updateContributionStatus(
    contributionId: string,
    status: ContributionStatus,
    moderatorId: string,
    rejectionComment?: string,
  ) {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['anime'],
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    const moderator = await this.userRepository.findOne({
      where: { id: moderatorId },
    });

    if (!moderator) {
      throw new BadRequestException('Moderator not found');
    }

    contribution.status = status;
    contribution.moderator = moderator;

    if (status === ContributionStatus.REJECTED && rejectionComment) {
      contribution.rejectionComment = rejectionComment;
    }

    if (status === ContributionStatus.ACCEPTED) {
      if (!contribution.anime) {
        const newAnime = this.animeRepository.create(contribution.changeData);
        contribution.anime = await this.animeRepository.save(newAnime);
      } else {
        return await this.animeRepository.update(
          contribution.anime.id,
          contribution.changeData,
        );
      }
    }

    return this.contributionRepository.save(contribution);
  }

  async findContributions({
    page = 1,
    limit = 20,
    status,
    userId,
    animeId,
  }: {
    page: number;
    limit: number;
    status?: ContributionStatus;
    userId?: string;
    animeId?: string;
  }) {
    const queryBuilder = this.contributionRepository
      .createQueryBuilder('contribution')
      .leftJoinAndSelect('contribution.anime', 'anime')
      .leftJoinAndSelect('contribution.user', 'user')
      .leftJoinAndSelect('contribution.moderator', 'moderator');

    if (status) {
      queryBuilder.andWhere('contribution.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    if (animeId) {
      queryBuilder.andWhere('anime.id = :animeId', { animeId });
    }

    const [result, total] = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('contribution.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getContributionById(contributionId: string) {
    return this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['anime', 'user', 'moderator'],
    });
  }

  async deleteContributionById(contributionId: string, user: User) {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['user'],
    });
    if (
      !contribution ||
      !user ||
      (contribution.user.id !== user.id &&
        user.role !== Role.Admin &&
        user.role !== Role.Moderator)
    ) {
      throw new NotFoundException('Contribution not found');
    }
    return this.contributionRepository.remove(contribution);
  }
}
