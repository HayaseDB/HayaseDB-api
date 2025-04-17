import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  BeforeInsert,
  ManyToOne,
  JoinColumn, BeforeUpdate,
} from 'typeorm';
import { User } from '@/module/users/entities/user.entity';

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @ManyToOne(() => User, (user) => user.media, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  filetype: string;

  @Column('bytea', { select: false })
  fileBuffer: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int' })
  size: number;

  url: string;

  @BeforeInsert()
  calculateSize() {
    if (this.fileBuffer) {
      this.size = this.fileBuffer.length;
    }
  }


  @AfterLoad()
  generateUrl() {
    const baseUrl = process.env.APP_BASE_URL;
    if (baseUrl) {
      this.url = `${baseUrl}/media/${this.id}`;
    }
  }
}
