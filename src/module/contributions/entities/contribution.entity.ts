import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '@/module/users/entities/user.entity';
import { Anime } from '@/module/animes/entities/anime.entity';

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

  @ManyToOne(() => Anime, (anime) => anime.contributions, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  anime: Anime;

  @Column(() => Anime)
  originalAnime: { [p: string]: any };

  @BeforeInsert()
  snapshotOriginalAnime() {
    if (this.anime) {
      this.originalAnime = { ...this.anime };
    } else if (this.data && this.data.id) {
      this.originalAnime = { ...this.data };
    } else {
      this.originalAnime = {};
    }
  }
}
