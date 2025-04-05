import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contribution,
  ContributionStatus,
} from './entities/contribution.entity';
import { Anime } from '../animes/entities/anime.entity';
import { User } from '../users/entities/user.entity';

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

  async suggestEditToAnime(animeId: string, data: any, userId: string) {
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
      throw new BadRequestException(
        'You already have a pending contribution for this anime',
      );
    }

    const contribution = this.contributionRepository.create({
      anime,
      user,
      changeData: data,
      status: ContributionStatus.PENDING,
    });

    return await this.contributionRepository.save(contribution);
  }

  async editContribution(contributionId: string, data: any, userId: string) {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['user'],
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    if (contribution.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own contributions');
    }

    if (contribution.status !== ContributionStatus.PENDING) {
      throw new BadRequestException('Only pending contributions can be edited');
    }

    contribution.changeData = data;
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

    if (status === ContributionStatus.APPROVED) {
      if (!contribution.anime) {
        const newAnime = this.animeRepository.create(contribution.changeData);
        const savedAnime = await this.animeRepository.save(newAnime);
        contribution.anime = savedAnime;
      } else {
        await this.animeRepository.update(
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
}
