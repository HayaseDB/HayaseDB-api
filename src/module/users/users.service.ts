import {BadRequestException, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/module/users/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {Pfp} from "@/module/users/entities/pfp.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Pfp)
    private readonly pfpRepository: Repository<Pfp>,
  ) {}

  create(email: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ email, password });
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'password',
        'media',
        'contributions',
        'createdAt',
        'updatedAt',
        'verified',
        'moderatedContributions',
        'role',
      ],
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'email',
        'password',
        'media',
        'contributions',
        'createdAt',
        'updatedAt',
        'verified',
        'moderatedContributions',
        'role',
      ],
    });
  }

  getProfile(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'media',
        'contributions',
        'createdAt',
        'updatedAt',
        'verified',
        'role',
      ],
    });
  }

  async verifyUser(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    user.verified = true;
    return this.usersRepository.save(user);
  }

  async update(user: User): Promise<User | null> {
    await this.usersRepository.save(user);
    return this.getProfile(user.id);
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    await this.usersRepository.update(userId, updateUserDto);
    return this.getProfile(userId);
  }

  async updateProfilePicture(
      userId: string,
      buffer: Buffer,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['pfp'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.pfp) {
      await this.pfpRepository.remove(user.pfp);
    }

    const newPfp = this.pfpRepository.create({
      data: buffer,
      user: user,
    });

    await this.pfpRepository.save(newPfp);

    return this.getProfile(userId);
  }


  async getPfpById(pfpId: string): Promise<Buffer | null> {
    try {
      const pfp = await this.pfpRepository.findOne({
        where: { id: pfpId },
        select: ['data'],
      });
      return pfp?.data ?? null;
    } catch {
      return null;
    }
  }

  async countUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
