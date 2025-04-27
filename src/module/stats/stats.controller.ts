import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get statistics',
    description:
      'Fetches various statistics related to the system or application.',
  })
  async getStats() {
    return this.statsService.getStats();
  }
}
