import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { MinioService } from '@/module/minio/minio.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
      @InjectRepository(Media) private mediaRepository: Repository<Media>,
      private readonly minioService: MinioService,
  ) {}

  async uploadMedia(
      createMediaDto: CreateMediaDto,
      file: Express.Multer.File,
  ): Promise<Media> {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      const filename = await this.minioService.uploadFile(
          'media',
          file.originalname,
          file.buffer,
      );

      const media = new Media();
      media.filename = file.originalname;
      media.key = filename;
      media.mimeType = file.mimetype;
      media.size = file.size;
      media.role = createMediaDto.role;

      return this.mediaRepository.save(media);
    } catch (error) {
      throw new Error('Error during media upload: ' + error.message);
    }
  }

  async getMediaById(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }
    return media;
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }

    await this.minioService.deleteFile('media', media.key);

    await this.mediaRepository.delete(id);
  }
}
