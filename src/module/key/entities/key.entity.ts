import {BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
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

    @BeforeInsert()
    generateKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let result = '';

        for (let i = 0; i < 69; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength);
            result += characters[randomIndex];
        }
        this.key = result;
    }
}
