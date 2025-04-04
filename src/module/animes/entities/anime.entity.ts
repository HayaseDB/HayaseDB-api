import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Contribution } from '@/module/contributions/entities/contribution.entity';

@Entity('animes')
export class Anime {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 255 })
	title: string;

	@Column({ length: 255 })
	genre: string;

	@Column()
	episodes: number;

	@Column({ type: 'date' })
	releaseDate: Date;

	@Column({ type: 'text', nullable: true })
	synopsis?: string;

	@Column({ length: 255, nullable: true })
	studio?: string;

	@OneToMany(() => Contribution, (contribution) => contribution.user)
	contributions: Contribution[];

	@OneToMany(() => Contribution, (contribution) => contribution.moderator)
	moderatedContributions: Contribution[];
}
