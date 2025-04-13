import {
  applyDecorators,
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { KeyGuard } from '../guard/key.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function KeyAuth() {
  return applyDecorators(UseGuards(KeyGuard), ApiBearerAuth('key'));
}

export const GetKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ key?: string }>();
    return request.key;
  },
);
