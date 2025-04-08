import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    BadRequestException,
    InternalServerErrorException, Patch, NotFoundException
} from '@nestjs/common';
import { KeyService } from './key.service';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Auth, GetUser} from "@/module/auth/decorator/auth.decorator";
import {User} from "@/module/users/entities/user.entity";
import {CreateKeyDto} from "@/module/key/dto/create-key.dto";
import {Key} from "@/module/key/entities/key.entity";

@ApiTags('keys')
@Controller('keys')
export class KeyController {
    constructor(private readonly keyService: KeyService) {}

    @Post()
    @Auth('User')
    @ApiBody({ type: CreateKeyDto })
    async createKey(
        @Body() body: CreateKeyDto,
        @GetUser() user: User
    ): Promise<any> {
        const key: Key =  await this.keyService.createKey(user, body.name);
        if (!key) {
            throw new InternalServerErrorException('Error creating API key');
        }
        return {
            id: key.id,
            name: key.name,
            key: key.key,
        };
    }

    @Get()
    @Auth('User')
    async getKeys(@GetUser() user: User): Promise<any> {
        return this.keyService.getKeysByUserId(user.id);
    }


    @Get('check')
    async validateKey(@Param('id') key: string): Promise<any> {
        const validKey = await this.keyService.validateKey(key);

        if (!validKey) {
            throw new NotFoundException('Key not found or is Invalid');
        }
    }

    @Delete(':id')
    @Auth('User')
    async deleteKey(@GetUser() user: User, @Param('id') id: string) {
        await this.keyService.deleteKey(id, user);
        return { message: 'API key deleted successfully' };
    }

    @Patch(':id/regenerate')
    @Auth('User')
    async regenerateKey(@GetUser() user: User, @Param('id') id: string): Promise<any> {
        const key: Key = await this.keyService.regenerateKey(id, user);
        if (!key) {
            throw new BadRequestException('Invalid API key ID or permission denied');
        }
        return {
            id: key.id,
            name: key.name,
            key: key.key,
        };
    }
}