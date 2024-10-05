import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: number;

  @Column()
  @IsString()
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @Column()
  @IsEmail()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @Column()
  @IsString()
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
