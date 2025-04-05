import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contribution,
  ContributionStatus,
} from './entities/contribution.entity';
import { Anime } from '../animes/entities/anime.entity';
import { User } from '../users/entities/user.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';

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

  async createContribution(createDto: CreateContributionDto, userId) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newAnime = this.animeRepository.create(createDto);
    const savedAnime = await this.animeRepository.save(newAnime);

    const contribution = this.contributionRepository.create({
      anime: savedAnime,
      user,
      changeData: createDto,
      status: ContributionStatus.PENDING,
      submission_type: 'new',
    });

    return await this.contributionRepository.save(contribution);
  }

  async createOrUpdateContribution(
    animeId: string,
    createDto: CreateContributionDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: 'currentUserId' },
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

    const contribution = this.contributionRepository.create({
      anime,
      user,
      changeData: createDto,
      status: ContributionStatus.PENDING,
      submission_type: 'edit',
    });

    return await this.contributionRepository.save(contribution);
  }

  async editContributionRequest(
    animeId: string,
    createDto: CreateContributionDto,
  ) {
    const contribution = await this.contributionRepository.findOne({
      where: { anime: { id: animeId } },
    });
    if (!contribution) {
      throw new BadRequestException('Contribution not found');
    }

    contribution.changeData = createDto;
    return await this.contributionRepository.save(contribution);
  }

  async updateContributionStatus(animeId: string, status: ContributionStatus) {
    const contribution = await this.contributionRepository.findOne({
      where: { anime: { id: animeId } },
    });
    if (!contribution) {
      throw new BadRequestException('Contribution not found');
    }

    contribution.status = status;

    if (status === ContributionStatus.APPROVED) {
      await this.animeRepository.update(
        contribution.anime.id,
        contribution.changeData,
      );
    }

    return this.contributionRepository.save(contribution);
  }

  async findPendingContributions(page: number, limit: number) {
    const [result, total] = await this.contributionRepository.findAndCount({
      where: { status: ContributionStatus.PENDING },
      relations: ['anime', 'user'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return { result, total, page, limit };
  }

  async getContributionById(contributionId: string) {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['anime', 'user'],
    });

    if (!contribution) {
      throw new BadRequestException('Contribution not found');
    }

    return contribution;
  }
}
