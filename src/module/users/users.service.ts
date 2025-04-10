import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/module/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(email: string, password: string): Promise<User> {
    const user = new User();
    user.email = email;
    user.password = password;
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[] | null> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'password',
        'username',
        'email',
        'media',
        'contributions',
        'createdAt',
        'verified',
        'moderatedContributions',
        'updatedAt',
        'role',
        'id',
      ],
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email },
      select: [
        'password',
        'username',
        'email',
        'media',
        'contributions',
        'createdAt',
        'verified',
        'moderatedContributions',
        'updatedAt',
        'role',
        'id',
      ],
    });
  }
  async verifyUser(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (user) {
      user.verified = true;
      return this.usersRepository.save(user);
    }
    return null;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
