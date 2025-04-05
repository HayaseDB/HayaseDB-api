import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Anime } from '@/module/animes/entities/anime.entity';
import { User } from '@/module/users/entities/user.entity';

export enum MediaType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
    AUDIO = 'audio',
    OTHER = 'other',
}

export enum MediaRole {
    COVER = 'cover',
    BANNER = 'banner',
    THUMBNAIL = 'thumbnail',
    OTHER = 'other',
}

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    key: string;

    @Column()
    mimeType: string;

    @Column({ type: 'int', nullable: true })
    size: number;

    @Column({
        type: 'enum',
        enum: MediaType,
        default: MediaType.IMAGE,
    })
    type: MediaType;

    @Column({
        type: 'enum',
        enum: MediaRole,
        default: MediaRole.OTHER,
    })
    role: string | undefined;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true })
    height: number;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    format: string;

    @Column({ default: false })
    isTemporary: boolean;

    @Column({ nullable: true })
    expiresAt: Date;

    @Column({ nullable: true })
    deletedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Anime, (anime) => anime.media, { nullable: true })
    @JoinColumn({ name: 'animeId' })
    anime: Anime;

    @ManyToOne(() => User, (user) => user.media, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}
