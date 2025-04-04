import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
} from 'typeorm';
import { User } from '@/module/users/entities/user.entity';
import { Anime } from '@/module/animes/entities/anime.entity';

export enum ContributionStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
}

@Entity('contributions')
export class Contribution {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Anime, (anime) => anime.contributions, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	anime: Anime;

	@ManyToOne(() => User, (user) => user.contributions, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	user: User;

	@Column({ type: 'jsonb' })
	changeData: Record<string, any>;

	@Column({
		type: 'enum',
		enum: ContributionStatus,
		default: ContributionStatus.PENDING,
	})
	status: ContributionStatus;

	@ManyToOne(() => User, (user) => user.moderatedContributions, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	moderator?: User;

	@CreateDateColumn()
	createdAt: Date;
}
