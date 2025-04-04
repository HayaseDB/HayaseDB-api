import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate,
	OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';
import { Contribution } from '@/module/contributions/entities/contribution.entity';

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
	isEmailVerified: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Contribution, (contribution) => contribution.user)
	contributions: Contribution[];

	@OneToMany(() => Contribution, (contribution) => contribution.moderator)
	moderatedContributions: Contribution[];

	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}
}
