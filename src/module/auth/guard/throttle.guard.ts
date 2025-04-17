import { Injectable, ExecutionContext } from '@nestjs/common';
import {ThrottlerException, ThrottlerGuard} from '@nestjs/throttler';

@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
    protected throwThrottlingException(): any {
        throw new ThrottlerException("Rate limit exceeded, please wait or get a free api key");
    }
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ips.length ? req.ips[0] : req.ip;
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (request.skipThrottler === true) {
            return true;
        }

        return super.canActivate(context);
    }
}