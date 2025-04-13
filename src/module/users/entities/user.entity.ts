import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Contribution } from '@/module/contributions/entities/contribution.entity';
import { generateUsername } from '@/module/users/utility';
import { Media } from '@/module/media/entities/media.entity';
import { Key } from '@/module/key/entities/key.entity';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Moderator = 'moderator',
}

export enum Plan {
  Free = 'free',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, select: false })
  @IsEmail()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: Plan,
    default: Plan.Free,
  })
  plan: Plan;

  @OneToMany(() => Key, (key) => key.user)
  keys: Key[];

  @Column({ default: false, select: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];

  @OneToMany(() => Contribution, (contribution) => contribution.moderator)
  moderatedContributions: Contribution[];

  @OneToMany(() => Media, (media) => media.author)
  media: Media[];

  @Column('bytea', { select: false, nullable: true })
  profilePicture: Buffer;

  pfp: string;

  @BeforeInsert()
  setDefaultUsername() {
    if (!this.username) {
      this.username = generateUsername();
    }
  }

  @AfterLoad()
  generateUrl() {
    const baseUrl = process.env.APP_BASE_URL;
    if (baseUrl) {
      this.pfp = `${baseUrl}/users/pfp/${this.id}`;
    }
  }
}
