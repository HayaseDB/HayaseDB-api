import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from './entities/key.entity';
import { User } from '@/module/users/entities/user.entity';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
  ) {}

  async createKey(user: User, name?: string): Promise<Key> {
    const newKey = new Key();
    newKey.user = user;
    newKey.name = name || 'Default API Key';
    return await this.keyRepository.save(newKey);
  }

  async regenerateKey(id: string, user: User): Promise<Key> {
    const key = await this.keyRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!key) {
      throw new NotFoundException('API key not found.');
    }

    if (key.user.id !== user.id) {
      throw new NotFoundException(
        'This API key does not belong to the authenticated user.',
      );
    }
    key.generateKey();

    await this.keyRepository.save(key);

    return key;
  }

  async getKeysByUserId(userId: string): Promise<Key[]> {
    return await this.keyRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async validateKey(key: string): Promise<Key | null> {
    return await this.keyRepository.findOne({
      where: { key },
      relations: ['user'],
    });
  }

  async updateKeyUsage(
    keyId: string,
    requestCount: number,
    requestCountTotal: number,
    lastUsedAt: Date,
  ): Promise<void> {
    await this.keyRepository.update(keyId, {
      requestCount,
      requestCountTotal,
      lastUsedAt,
    });
  }

  async countRequests(): Promise<number> {
    const total = await this.keyRepository
      .createQueryBuilder('key')
      .select('SUM(key.requestCountTotal)', 'sum')
      .getRawOne();
    return Number(total.sum);
  }

  async deleteKey(id: string, user: User): Promise<void> {
    const key = await this.keyRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!key) {
      throw new NotFoundException('API key not found.');
    }

    if (key.user.id !== user.id) {
      throw new NotFoundException(
        'This API key does not belong to the authenticated user.',
      );
    }

    await this.keyRepository.remove(key);
  }
}
