import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Contribution } from '@/module/contributions/entities/contribution.entity';
import { generateUsername } from '@/module/users/utility';
import { Media } from '@/module/media/entities/media.entity';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Moderator = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];

  @OneToMany(() => Contribution, (contribution) => contribution.moderator)
  moderatedContributions: Contribution[];

  @OneToMany(() => Media, (media) => media.user)
  media: Media[];

  @BeforeInsert()
  setDefaultUsername() {
    if (!this.username) {
      this.username = generateUsername();
    }
  }
}
