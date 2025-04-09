import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "@/module/users/entities/user.entity";

@Entity('keys')
export class Key {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    key: string;

    @Column({ nullable: true })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.keys)
    user: User;

    @Column({ default: 0 })
    requestCount: number;

    @Column({ nullable: true, type: 'timestamp' })
    lastUsedAt: Date;
}
