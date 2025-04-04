import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
	Contribution,
	ContributionStatus,
} from '@/module/contributions/entities/contribution.entity';
import { CreateContributionDto } from '@/module/contributions/dto/create-contribution.dto';
import { UpdateContributionStatusDto } from '@/module/contributions/dto/update-contribution-status.dto';
import { Anime } from '@/module/animes/entities/anime.entity';
import { User } from '@/module/users/entities/user.entity';

@Injectable()
export class ContributionService {
	constructor(
		@InjectRepository(Contribution)
		private contributionRepository: Repository<Contribution>,
		@InjectRepository(Anime)
		private animeRepository: Repository<Anime>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async create(createDto: CreateContributionDto) {
		const anime = await this.animeRepository.findOne({
			where: { id: createDto.animeId },
		});
		const user = await this.userRepository.findOne({
			where: { id: createDto.userId },
		});

		if (!anime || !user) {
			throw new Error('Invalid anime or user ID');
		}

		const contribution = this.contributionRepository.create({
			anime,
			user,
			changeData: createDto.changeData,
			status: ContributionStatus.PENDING,
		});

		return this.contributionRepository.save(contribution);
	}

	async findPendingRequests() {
		return this.contributionRepository.find({
			where: { status: ContributionStatus.PENDING },
			relations: ['anime', 'user'],
		});
	}

	async updateStatus(id: string, updateDto: UpdateContributionStatusDto) {
		const contribution = await this.contributionRepository.findOne({
			where: { id },
		});

		if (!contribution) {
			throw new Error('Contribution request not found');
		}

		if (updateDto.moderatorId) {
			const moderator = await this.userRepository.findOne({
				where: { id: updateDto.moderatorId },
			});
			if (
				!moderator ||
				(moderator.role !== 'moderator' && moderator.role !== 'admin')
			) {
				throw new Error('Invalid moderator ID');
			}
			contribution.moderator = moderator;
		}

		contribution.status = updateDto.status;

		if (updateDto.status === ContributionStatus.APPROVED) {
			await this.animeRepository.update(
				contribution.anime.id,
				contribution.changeData,
			);
		}

		return this.contributionRepository.save(contribution);
	}
}
