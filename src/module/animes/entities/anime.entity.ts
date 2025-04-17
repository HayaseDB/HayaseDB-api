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
import {Label} from "@/module/animes/decorator/label.decorator";
import {Type} from "@/module/animes/decorator/type.decorator";
import {Required} from "@/module/animes/decorator/required.decorator";

export enum AnimeStatus {
  AIRING = 'Airing',
  COMPLETED = 'Completed',
  UPCOMING = 'Upcoming',
  ON_HOLD = 'On Hold',
  CANCELLED = 'Cancelled',
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
  @Type('Uuid')
  @Label('Id')
  id: string;

  @Column({ length: 255 })
  @Label("Title")
  @Required()
  title: string;

  @Column('text', { array: true, nullable: true })
  @Label("Genres")
  genres?: string[];

  @Column({ type: 'date', nullable: true })
  @Label("Release date")
  releaseDate?: Date;

  @Column({ length: 255, nullable: true })
  @Label("Studio")
  studio?: string;

  @Column({ nullable: true, type: 'text' })
  @Type('Text')
  @Label("Description")
  description?: string;

  @Column({
    type: 'enum',
    enum: AnimeStatus,
    nullable: true,
  })
  @Label("Status")
  @Type('Enum')
  status?: AnimeStatus;

  @Column({
    type: 'enum',
    enum: AnimeType,
    nullable: true,
  })
  @Label("Type")
  @Type('Enum')
  type?: AnimeType;

  @Column({ length: 255, nullable: true })
  @Label("Trailer")
  @Type('Url')
  trailerUrl?: string;

  @Column({ length: 255, nullable: true })
  @Label("Main Director")
  mainDirector?: string;

  @Column({ length: 255, nullable: true })
  @Label("Music Composer")
  musicComposer?: string;

  @Column({ length: 255, nullable: true })
  @Label("Official Website")
  @Type('Url')
  officialWebsiteUrl?: string;

  @OneToMany(() => Contribution, (contribution) => contribution.anime)
  contributions: Contribution[];

  @OneToMany(() => Contribution, (contribution) => contribution.moderator,)
  moderatedContributions: Contribution[];

  @ManyToOne(() => Media, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'bannerImage', referencedColumnName: 'id' })
  @Type('Image')
  @Label("Banner Image")
  bannerImage?: string;

  @ManyToOne(() => Media, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'coverImage', referencedColumnName: 'id' })
  @Type('Image')
  @Label("Cover Image")
  coverImage?: string;
}
