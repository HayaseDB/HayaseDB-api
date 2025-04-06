import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from '@/module/auth/guard/roles.guard';
import type { Role } from '@/module/users/entities/user.entity';

/**
 * Custom decorator to combine JwtAuthGuard and ApiBearerAuth in one decorator.
 * Accepts roles as string while maintaining IntelliSense.
 */
export function Auth(...roles: (keyof typeof Role)[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
  );
}

/**
 * Extracts the authenticated user from the request
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Express.User | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: Express.User }>();
    return request.user ?? null;
  },
);
