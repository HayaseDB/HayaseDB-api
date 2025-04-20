import { Injectable } from '@nestjs/common';
import { UsersService } from '@/module/users/users.service';
import { AnimesService } from '@/module/animes/animes.service';
import { KeyService } from '@/module/key/key.service';
import { MediaService } from '@/module/media/media.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly userService: UsersService,
    private readonly animeService: AnimesService,
    private readonly keyService: KeyService,
    private readonly mediaService: MediaService,
  ) {}

  async getStats() {
    const totalUsers = await this.userService.countUsers();
    const totalAnimes = await this.animeService.countAnime();
    const totalMedia = await this.mediaService.countMedia();
    const totalRequests = await this.keyService.countRequests();

    return {
      totalUsers,
      totalAnimes,
      totalMedia,
      totalRequests,
    };
  }
}
