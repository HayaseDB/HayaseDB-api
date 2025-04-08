import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '@/module/auth/guard/roles.guard';
import type { Role } from '@/module/users/entities/user.entity';

export function Auth(...roles: (keyof typeof Role)[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('token'),
  );
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Express.User | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: Express.User }>();
    return request.user ?? null;
  },
);
