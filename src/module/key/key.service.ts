import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Key} from './entities/key.entity';
import {User} from '@/module/users/entities/user.entity';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class KeyService {
    constructor(
        @InjectRepository(Key)
        private readonly keyRepository: Repository<Key>,
    ) {}

    async createKey(user: User, name?: string): Promise<Key> {
        const newKey = new Key();
        newKey.user = user;
        newKey.key = uuidv4();
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
            throw new NotFoundException('This API key does not belong to the authenticated user.');
        }


        key.key = uuidv4();

        await this.keyRepository.save(key);

        return key;
    }

    async getKeysByUserId(userId: string): Promise<Key[]> {
        const keys = await this.keyRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (keys.length === 0) {
            throw new NotFoundException('No API keys found for this user.');
        }

        return keys;
    }

    async validateKey(key: string): Promise<Key | null> {
            return await this.keyRepository.findOne({
                where: { key },
            });

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
            throw new NotFoundException('This API key does not belong to the authenticated user.');
        }

        await this.keyRepository.remove(key);
    }

}
