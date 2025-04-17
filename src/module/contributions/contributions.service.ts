import {BadRequestException, ForbiddenException, Injectable, NotFoundException, Type} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {getMetadataArgsStorage, Repository} from 'typeorm';
import {Contribution, ContributionStatus} from './entities/contribution.entity';
import {Anime} from '../animes/entities/anime.entity';
import {Role, User} from '../users/entities/user.entity';
import {merge, mergeWith} from 'lodash';
import 'reflect-metadata';

interface PaginationFilter {
  page?: number;
  limit?: number;
  status?: ContributionStatus;
  userId?: string;
  animeId?: string;
}

@Injectable()
export class ContributionsService {
  constructor(
      @InjectRepository(Contribution)
      private readonly contributionRepository: Repository<Contribution>,
      @InjectRepository(Anime)
      private readonly animeRepository: Repository<Anime>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Record<string, any>, userId: string): Promise<Contribution> {
    const user = await this.findUserById(userId);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Invalid contribution data format');
    }

    const contribution = this.contributionRepository.create({
      user,
      data,
      status: ContributionStatus.PENDING,
    });
    const savedContribution = await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async suggestEdit(animeId: string, data: Partial<Anime>, userId: string): Promise<Contribution> {
    const user = await this.findUserById(userId);
    const anime = await this.findAnimeById(animeId);
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }
    function customMerge(objValue: any, srcValue: any) {
      if (Array.isArray(objValue)) {
        return srcValue;
      }
    }
    const updatedAnimeData = mergeWith({}, anime, data, customMerge);
    const contribution = this.contributionRepository.create({
      anime,
      user,
      data: updatedAnimeData,
      status: ContributionStatus.PENDING,
    });
    const savedContribution = await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async update(
      contributionId: string,
      data: Record<string, any>,
      user: User,
  ): Promise<Contribution | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const contribution = await this.findContributionById(contributionId);

    if (contribution.user.id !== user.id && ![Role.Admin, Role.Moderator].includes(user.role)) {
      throw new ForbiddenException('You are not allowed to update this contribution');
    }

    contribution.data = merge({}, contribution.data, data);
    contribution.status = ContributionStatus.PENDING;
    await this.contributionRepository.save(contribution);

    return this.findById(contribution.id);
  }

  async updateStatus(
      contributionId: string,
      status: ContributionStatus,
      moderatorId: string,
      rejectionComment?: string,
  ): Promise<Contribution | null | { id: string; affected?: number; contribution: Contribution }> {
    const contribution = await this.findContributionById(contributionId);
    const moderator = await this.findUserById(moderatorId);

    if (![Role.Admin, Role.Moderator].includes(moderator.role)) {
      throw new ForbiddenException('User does not have moderator permissions');
    }

    contribution.status = status;
    contribution.moderator = moderator;

    if (status === ContributionStatus.REJECTED) {
      if (!rejectionComment) {
        throw new BadRequestException('Rejection comment is required');
      }
      contribution.rejectionComment = rejectionComment;
      return this.contributionRepository.save(contribution);
    }

    if (status === ContributionStatus.ACCEPTED) {
      await this.applyAcceptedContribution(contribution);
    }

    const savedContribution = await this.contributionRepository.save(contribution);
    return this.findById(savedContribution.id);
  }

  async findAll(filters: PaginationFilter): Promise<{
    items: Contribution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, status, userId, animeId } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (userId) where.user = { id: userId };
    if (animeId) where.anime = { id: animeId };

    const [items, total] = await this.contributionRepository.findAndCount({
      where,
      relations: ['moderator', 'user', 'anime'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(contributionId: string, user?: User): Promise<any> {
    const contribution = await this.contributionRepository.findOne({
      where: { id: contributionId },
      relations: ['anime', 'user', 'moderator'],
    });

    const isPrivileged = user && [Role.Admin, Role.Moderator].includes(user.role);
    const isOwner = user && contribution?.user?.id === user.id;

    if (!contribution || (user && !isOwner && !isPrivileged)) {
      throw new NotFoundException('Contribution not found');
    }

    const result: any = { ...contribution };

    if (contribution.data) {
      result.data = this.enrichFields(contribution.data, Anime);
    }

    if (contribution.anime) {
      result.anime = this.enrichFields(contribution.anime, Anime);
    }

    return result;
  }

  private enrichFields(obj: any, entityClass: Type<any>): any {
    if (!obj || typeof obj !== 'object') {
      return {
        value: obj,
        type: typeof obj,
      };
    }

    const result: Record<string, any> = {};

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === undefined) {
        continue;
      }

      const isArray = Array.isArray(value);
      let hayaseType, designType, rawType;

      try {
        // Check if entityClass.prototype exists before accessing metadata
        if (entityClass && entityClass.prototype) {
          hayaseType = Reflect.getMetadata('hayase:type', entityClass.prototype, key);
          designType = Reflect.getMetadata('design:type', entityClass.prototype, key);
          rawType = designType;
        } else {
          // Handle case when entityClass or its prototype is undefined
          hayaseType = undefined;
          designType = undefined;
          rawType = undefined;
        }
      } catch (e) {
        console.error(`Error getting metadata for key: ${key}`, e);
        // Instead of skipping, set defaults
        hayaseType = undefined;
        designType = undefined;
        rawType = undefined;
      }

      // Safely access designType name
      const fieldType = hayaseType || (designType ? designType.name : undefined);

      let label;
      try {
        if (entityClass && entityClass.prototype) {
          label = Reflect.getMetadata('hayase:label', entityClass.prototype, key) ?? key;
        } else {
          label = key;
        }
      } catch (e) {
        console.error(`Error getting label metadata for key: ${key}`, e);
        label = key;
      }

      const enriched: any = {
        value,
        type: rawType,
        label,
      };

      if (value && typeof value === 'object') {
        const isArrayOfObjects = isArray && value.length > 0 && value.every((item: any) => item && typeof item === 'object');

        if (isArrayOfObjects) {
          let elementType;
          try {
            if (entityClass && entityClass.prototype) {
              elementType = Reflect.getMetadata('design:elementtype', entityClass.prototype, key) || Object;
            } else {
              elementType = Object;
            }
          } catch (e) {
            console.error(`Error getting element type metadata for key: ${key}`, e);
            elementType = Object;
          }

          enriched.children = value.map((item: any) =>
              this.enrichFields(item, elementType)
          );
        } else if (!isArray && (!rawType || rawType.name !== 'Date')) {
          const nestedType = fieldType || Object;
          enriched.children = this.enrichFields(value, nestedType);
        }
      }

      result[key] = enriched;
    }

    return result;
  }
  getEntitySchema(): Array<Record<string, any>> {
    const schema: Array<Record<string, any>> = [];
    const proto = Anime.prototype;

    const addField = (key: string, options: any, isEnum = false, enumValues?: any, requiredFlag?: boolean) => {
      const type = Reflect.getMetadata('hayase:type', proto, key) || Reflect.getMetadata('design:type', proto, key);
      const label = Reflect.getMetadata('hayase:label', proto, key) ?? key;
      const required = Reflect.getMetadata('hayase:required', proto, key) ?? requiredFlag;

      const field: any = {
        name: key,
        type: type?.name ?? 'unknown',
        label,
        required,
      };

      if (isEnum && enumValues) field.options = Object.values(enumValues);
      schema.push(field);
    };

    for (const col of getMetadataArgsStorage().columns.filter(c => c.target === Anime && c.options.select !== false)) {
      addField(col.propertyName, col.options, col.options.type === 'enum', col.options.enum, col.options.nullable === false);
    }

    for (const rel of getMetadataArgsStorage().relations.filter(r => r.target === Anime && r.options?.eager)) {
      addField(rel.propertyName, rel.options, false, undefined, rel.options?.nullable === false);
    }

    return schema;
  }




  async delete(contributionId: string, user: User): Promise<Contribution> {
    const contribution = await this.findContributionById(contributionId);

    if (contribution.user.id !== user.id && ![Role.Admin, Role.Moderator].includes(user.role)) {
      throw new ForbiddenException('You do not have permission to delete this contribution');
    }

    return this.contributionRepository.remove(contribution);
  }

  private async findContributionById(contributionId: string): Promise<Contribution> {
    const contribution = await this.contributionRepository.findOne({ where: { id: contributionId } });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  private async findAnimeById(animeId: string): Promise<Anime> {
    const anime = await this.animeRepository.findOne({ where: { id: animeId } });
    if (!anime) {
      throw new BadRequestException('Anime not found');
    }
    return anime;
  }

  private async applyAcceptedContribution(contribution: Contribution): Promise<Contribution | { id: string; affected?: number; contribution: Contribution }> {
    if (!contribution.anime) {
      const newAnime = this.animeRepository.create(contribution.data);
      contribution.anime = await this.animeRepository.save(newAnime);
    } else {
      const result = await this.animeRepository.update(contribution.anime.id, contribution.data);
      return { id: contribution.id, affected: result.affected, contribution };
    }

    return this.contributionRepository.save(contribution);
  }
}
