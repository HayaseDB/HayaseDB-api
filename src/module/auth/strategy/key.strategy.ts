import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { KeyService } from '@/module/key/key.service';
import { Plan } from '@/module/users/entities/user.entity';
const RATE_LIMITS: Record<Plan, number> = {
  [Plan.Free]: 100,
  [Plan.Premium]: 1000,
  [Plan.Enterprise]: 3000,
};

@Injectable()
export class KeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'key') {
  constructor(private readonly keyService: KeyService) {
    super(
      {
        header: 'key',
        prefix: '',
      },
      false,
    );
  }

  async validate(apiKey: string) {
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing.');
    }
    const key = await this.keyService.validateKey(apiKey);
    if (!key) {
      throw new UnauthorizedException('Invalid API key.');
    }
    const userPlan = key.user?.plan;

    const rateLimit = RATE_LIMITS[userPlan] ?? RATE_LIMITS[Plan.Free];
    const now = new Date();

    if (key.lastUsedAt && this.isNewMinute(key.lastUsedAt, now)) {
      key.requestCount = 0;
    }
    if (key.requestCount > rateLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded: ${rateLimit} requests/min allowed for the ${userPlan} plan.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }



    key.requestCountTotal += 1;

    key.requestCount += 1;
    key.lastUsedAt = now;

    await this.keyService.updateKeyUsage(key.id, key.requestCount, key.requestCountTotal, now);

    return key;
  }

  private isNewMinute(lastUsed: Date, now: Date): boolean {
    return (
      Math.floor(lastUsed.getTime() / 60000) !==
      Math.floor(now.getTime() / 60000)
    );
  }
}
