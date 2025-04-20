import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@/module/users/entities/user.entity';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    role?: Role;
  };
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user || !request.user.role) {
      throw new ForbiddenException('User not authenticated or role missing');
    }

    const userRole = request.user.role;

    const requiredRolesEnum = requiredRoles.map(
      (role) => Role[role as keyof typeof Role],
    );

    if (requiredRolesEnum.includes(Role.Admin) && userRole === Role.Admin) {
      return true;
    }

    if (
      requiredRolesEnum.includes(Role.Moderator) &&
      (userRole === Role.Moderator || userRole === Role.Admin)
    ) {
      return true;
    }

    if (
      requiredRolesEnum.includes(Role.User) &&
      (userRole === Role.User ||
        userRole === Role.Moderator ||
        userRole === Role.Admin)
    ) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
