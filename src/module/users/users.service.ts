import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role, User } from '@/module/users/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pfp } from '@/module/users/entities/pfp.entity';
import { validate as isUuid } from 'uuid';
import * as bcrypt from "bcryptjs";
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

  async findAll(filters: {
    page: number;
    limit: number;
    role?: Role;
    verified?: boolean;
    search?: string;
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
  }) {
    const {
      page,
      limit,
      role,
      verified,
      search,
      sortColumn = 'createdAt',
      sortDirection = 'DESC',
    } = filters;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (verified !== undefined) {
      queryBuilder.andWhere('user.verified = :verified', { verified });
    }

    if (search) {
      const normalizedSearch = search.trim().toLowerCase();
      if (isUuid(search)) {
        queryBuilder.andWhere('user.id = :id', { id: search });
      } else {
        queryBuilder.andWhere(
          '(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search)',
          { search: `%${normalizedSearch}%` },
        );
      }
    }
    queryBuilder.leftJoinAndSelect('user.pfp', 'pfp');

    queryBuilder.orderBy(`user.${sortColumn}`, sortDirection);
    queryBuilder.skip((page - 1) * limit).take(limit);
    queryBuilder.select([
      'user.username',
      'user.email',
      'user.role',
      'user.verified',
      'user.createdAt',
      'user.id',
      'pfp',
    ]);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  getProfile(id: string, user?: User): Promise<User | null> {
    const selectFields: (keyof User)[] = [
      'id',
      'username',
      'media',
      'contributions',
      'createdAt',
      'role',
    ];

    if (user && (user.role === Role.Admin || user.role === Role.Moderator)) {
      selectFields.push('verified', 'updatedAt', 'email', 'banned');
    }

    return this.usersRepository.findOne({
      where: { id },
      select: selectFields,
    });
  }

  async updateVerified(
    id: string,
    verified: boolean,
  ): Promise<{ message: string; success: true }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.verified = verified;
    await this.usersRepository.save(user);

    return {
      success: true,
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
    };
  }

  async updateBanned(
    id: string,
    banned: boolean,
  ): Promise<{ message: string; success: true }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.banned = banned;
    await this.usersRepository.save(user);

    return {
      success: true,
      message: `User has been ${banned ? 'banned' : 'unbanned'} successfully`,
    };
  }

  async update(user: User): Promise<User | null> {
    await this.usersRepository.save(user);
    return this.getProfile(user.id);
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
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
