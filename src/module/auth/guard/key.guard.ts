import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KeyGuard extends AuthGuard('key') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const apiKey = request.headers['key'];

        if (!apiKey) {
            return true;
        }
        return (await super.canActivate(context)) as boolean;
    }
}
