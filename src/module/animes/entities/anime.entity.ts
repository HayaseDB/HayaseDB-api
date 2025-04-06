import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contribution } from '@/module/contributions/entities/contribution.entity';
import { Media } from '@/module/media/entities/media.entity';

export enum AnimeStatus {
  AIRING = 'airing',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum AnimeType {
  TV = 'TV',
  MOVIE = 'Movie',
  OVA = 'OVA',
  ONA = 'ONA',
  SPECIAL = 'Special',
}

@Entity('animes')
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { array: true, nullable: true })
  genres?: string[];

  @Column({ nullable: true })
  episodes?: number;

  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  @Column({ length: 255, nullable: true })
  studio?: string;

  @Column({ nullable: true, type: 'uuid' })
  bannerImage?: string;

  @Column({ nullable: true, type: 'uuid' })
  coverImage?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({
    type: 'enum',
    enum: AnimeStatus,
    nullable: true,
  })
  status?: AnimeStatus;

  @Column({
    type: 'enum',
    enum: AnimeType,
    nullable: true,
  })
  type?: AnimeType;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ length: 255, nullable: true })
  trailerUrl?: string;

  @Column({ length: 255, nullable: true })
  mainDirector?: string;

  @Column({ length: 255, nullable: true })
  musicComposer?: string;

  @Column({ length: 255, nullable: true })
  officialWebsiteUrl?: string;

  @OneToMany(() => Contribution, (contribution) => contribution.anime)
  contributions: Contribution[];

  @OneToMany(() => Contribution, (contribution) => contribution.moderator)
  moderatedContributions: Contribution[];

  @ManyToOne(() => Media, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'bannerImage', referencedColumnName: 'id' })
  bannerImageEntity?: Media;

  @ManyToOne(() => Media, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'coverImage', referencedColumnName: 'id' })
  coverImageEntity?: Media;
}
