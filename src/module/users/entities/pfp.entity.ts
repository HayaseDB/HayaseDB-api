import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToOne,
    AfterLoad,
    CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('pfps')
export class Pfp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('bytea', { nullable: true, select: false })
    data: Buffer;

    @CreateDateColumn()
    createdAt: Date;


    @OneToOne(() => User, (user) => user.pfp, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    url: string;

    @AfterLoad()
    generatePfpUrl() {
        const baseUrl = process.env.APP_BASE_URL;
        if (baseUrl && this.id) {
            this.url = `${baseUrl}/users/pfp/${this.id}`;
        }
    }

}
