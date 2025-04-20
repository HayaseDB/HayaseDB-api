import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KeyGuard extends AuthGuard('key') {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const keyHeader = request.headers['key'];

    if (!keyHeader) {
      request.skipThrottler = false;
      return true;
    }

    const result = await super.canActivate(context);
    if (result) {
      request.key = request.user;
      request.skipThrottler = true;
    }
    return result;
  }
}
