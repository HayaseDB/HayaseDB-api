import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnimeDto } from '@/module/animes/dto/create-anime.dto';
import { Anime } from '@/module/animes/entities/anime.entity';
import { UpdateAnimeDto } from '@/module/animes/dto/update-anime.dto';
import { EnrichmentService } from '@/module/enrichment/enrichment.service';

@Injectable()
export class AnimesService {
  constructor(
    @InjectRepository(Anime)
    private animesRepository: Repository<Anime>,
    private readonly enrichmentService: EnrichmentService,
  ) {}

  create(createAnimeDto: CreateAnimeDto) {
    const anime = this.animesRepository.create(createAnimeDto);
    return this.animesRepository.save(anime);
  }
  async findAll(query: {
    filters?: Record<string, any>;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    caseSensitive?: boolean;
  }) {
    const {
      filters = {},
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      caseSensitive = false,
    } = query;

    const take = Math.max(limit, 1);
    const skip = Math.max(page - 1, 0) * take;

    const qb = this.animesRepository.createQueryBuilder('anime');
    qb.addSelect(['anime.createdAt', 'anime.updatedAt']);
    const metadata = this.animesRepository.metadata;
    const validColumns = metadata.columns.map((col) => col.propertyName);
    const relations = metadata.relations;

    relations.forEach((relation) => {
      if (relation.isEager) {
        qb.leftJoinAndSelect(
            `anime.${relation.propertyName}`,
            relation.propertyName,
        );
      }
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (
          !validColumns.includes(key) ||
          value === undefined ||
          value === null ||
          value === ''
      )
        return;

      const paramKey = `filter_${key}`;

      if (key === 'id') {
        qb.andWhere(`anime.${key} = :${paramKey}`, {
          [paramKey]: String(value),
        });
      } else if (Array.isArray(value)) {
        qb.andWhere(`anime.${key} && :${paramKey}`, { [paramKey]: value });
      } else if (typeof value === 'string') {
        if (caseSensitive) {
          qb.andWhere(`anime.${key} LIKE :${paramKey}`, {
            [paramKey]: `%${value}%`,
          });
        } else {
          qb.andWhere(`LOWER(anime.${key}) LIKE LOWER(:${paramKey})`, {
            [paramKey]: `%${value}%`,
          });
        }
      } else {
        qb.andWhere(`anime.${key} = :${paramKey}`, { [paramKey]: value });
      }
    });

    const safeSortColumn = validColumns.includes(sortBy) ? sortBy : 'id';

    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(`anime.${safeSortColumn}`, safeSortOrder);

    qb.skip(skip).take(take);

    const [results, total] = await qb.getManyAndCount();

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const anime = await this.animesRepository.findOne({
      where: { id },
    });

    return this.enrichmentService.enrichFields(anime, Anime);
  }

  async countAnime(): Promise<number> {
    return this.animesRepository.count();
  }

  async update(id: string, updateAnimeDto: UpdateAnimeDto) {
    await this.animesRepository.update(id, updateAnimeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.animesRepository.delete(id);
    return { deleted: true };
  }
}
