import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import sharp from 'sharp';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from './entities/user.entity';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:userId')
  @Auth()
  async getProfile(
    @GetUser() user: User,
    @Param('userId') userId: string,
  ): Promise<User | null> {
    return this.usersService.getProfile(userId, user);
  }

  @Patch(':userId/:action')
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
  })
  @ApiParam({
    name: 'action',
    description: 'Action to perform on the user',
    enum: ['verify', 'unverify', 'ban', 'unban'],
  })
  async handleUserAction(
    @Param('userId') userId: string,
    @Param('action') action: 'verify' | 'unverify' | 'ban' | 'unban',
  ): Promise<any> {
    switch (action) {
      case 'verify':
        return this.usersService.updateVerified(userId, true);
      case 'unverify':
        return this.usersService.updateVerified(userId, false);
      case 'ban':
        return this.usersService.updateBanned(userId, true);
      case 'unban':
        return this.usersService.updateBanned(userId, false);
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  @Patch()
  @Auth('User')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<User | null> {
    if (!user) throw new BadRequestException('User not found');
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Put('pfp')
  @Auth('User')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfilePicture(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User | null> {
    if (!user || !file?.buffer) {
      throw new BadRequestException('User or file missing');
    }

    const processedBuffer = await sharp(file.buffer).jpeg().toBuffer();
    return this.usersService.updateProfilePicture(user.id, processedBuffer);
  }

  @Get()
  @Auth('Moderator')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortColumn',
    required: false,
    enum: ['createdAt', 'username', 'verified', 'email', 'role'],
  })
  @ApiQuery({ name: 'sortDirection', required: false, enum: ['ASC', 'DESC'] })
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: Role,
    @Query('verified') verified?: boolean,
    @Query('search') search?: string,
    @Query('sortColumn') sortColumn = 'createdAt',
    @Query('sortDirection') sortDirection: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.usersService.findAll({
      page,
      limit,
      role,
      verified,
      search,
      sortColumn,
      sortDirection,
    });
  }

  @Delete(':userId')
  @Auth('Admin')
  async deleteUser(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.usersService.remove(userId);
    return { message: 'User deleted' };
  }

  @Get('/pfp/:id')
  async getUserProfilePicture(@Param('id') id: string, @Res() res: Response) {
    const pfp = await this.usersService.getPfpById(id);

    if (!pfp) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${id}.jpeg"`,
      'Accept-Ranges': 'bytes',
    });

    return res.send(pfp);
  }

}
