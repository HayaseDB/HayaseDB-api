import {
  applyDecorators,
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { KeyGuard } from '../guard/key.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import {ThrottleGuard} from "@/module/auth/guard/throttle.guard";

export function KeyAuth() {
  return applyDecorators(UseGuards(KeyGuard, ThrottleGuard), ApiBearerAuth('key'));
}

export const GetKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ key?: string }>();
    return request.key;
  },
);
