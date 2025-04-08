import { applyDecorators, UseGuards, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KeyGuard } from '../guard/key.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function KeyAuth() {
    return applyDecorators(
        UseGuards(KeyGuard),
        ApiBearerAuth('key'),
    );
}

export const GetKey = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.key;
    },
);