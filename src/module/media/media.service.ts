import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {DeleteResult, Repository} from 'typeorm';
import { Media } from './entities/media.entity';
import { User } from '@/module/users/entities/user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async saveMedia(
    user: User,
    filename: string,
    filetype: string,
    fileBuffer: Buffer,
  ): Promise<Media> {
    const media = new Media();
    media.filename = filename;
    media.filetype = filetype;
    media.fileBuffer = fileBuffer;
    media.author = user;
    const savedMedia = await this.mediaRepository.save(media);

    savedMedia.generateUrl();

    return savedMedia;
  }

  async findById(mediaId: string): Promise<Media | null> {
    return this.mediaRepository.findOne({ where: { id: mediaId } });
  }



  async getFilebyId(mediaId: string): Promise<Media | null> {
    return this.mediaRepository.findOne({
      where: { id: mediaId },
      select: ['id', 'filename', 'filetype', 'fileBuffer'],
    });
  }

  async deleteMediaById(mediaId: string): Promise<DeleteResult> {
    return this.mediaRepository.delete({
    id: mediaId
    });
  }
}
