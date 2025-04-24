import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert, AfterInsert,
} from 'typeorm';
import { User } from '@/module/users/entities/user.entity';
import { Anime } from '@/module/animes/entities/anime.entity';
import {array} from "joi";

export enum ContributionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContributionStatus,
    default: ContributionStatus.PENDING,
  })
  status: ContributionStatus;

  @ManyToOne(() => User, (user) => user.contributions, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @Column({ nullable: true })
  rejectionComment: string;

  @ManyToOne(() => User, (user) => user.moderatedContributions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  moderator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @Column(() => Anime)
  data: { [p: string]: any };

  @Column({ type: 'jsonb', nullable: true })
  original: Anime;

  @ManyToOne(() => Anime, (anime) => anime.contributions, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  anime: Anime;

  @BeforeInsert()
  snapshotOriginalAnime() {
    if (this.anime) {
      this.original = { ...this.anime };
    }
  }
}
