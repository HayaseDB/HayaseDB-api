import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class KeyGuard extends AuthGuard('key') {
    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();

        const keyHeader = request.headers['key'];

        if (!keyHeader) {
            return true;
        }

            const result = await super.canActivate(context);
            if (result) {
                request.key = request.user;
            }
            return result;

    }
}