import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import sharp from 'sharp';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:userId')
  async getProfile(@Param('userId') userId: string): Promise<User | null> {
    return this.usersService.getProfile(userId);
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
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `inline; filename="${id}.jpeg"`,
    });

    return res.send(pfp);
  }
}
