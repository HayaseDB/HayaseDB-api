import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MediaService } from './media.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import sharp from 'sharp';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';
import { Role, User } from '@/module/users/entities/user.entity';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/webp',
  'image/png',
  'application/pdf',
];

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('')
  @ApiOperation({
    summary: 'Upload a media file',
    description:
      'Allows an authenticated user to upload an image or PDF file. Converts images to JPEG before saving.',
  })
  @Auth('User')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mediaBuffer = await sharp(file.buffer).toFormat('jpeg').toBuffer();

    const baseFilename = file.originalname.replace(/\.[^/.]+$/, '');
    const newFilename = `${baseFilename}.jpeg`;

    const savedMedia = await this.mediaService.saveMedia(
      user,
      newFilename,
      'image/jpeg',
      mediaBuffer,
    );

    return {
      message: 'File uploaded successfully',
      filename: savedMedia.filename,
      id: savedMedia.id,
      url: savedMedia.url,
    };
  }

  @Get(':id/meta')
  @ApiOperation({
    summary: 'Get media metadata',
    description:
      'Returns metadata (like URL, filename, size) for a specific media file. Admin access required.',
  })
  @Auth('Admin')
  async getMediaMeta(
    @Param('id') id: string,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    const media = await this.mediaService.findById(id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const response: any = {
      id: media.id,
      url: media.url,
      filename: media.filename,
      filetype: media.filetype,
      createdAt: media.createdAt,
      size: media.size,
    };

    if ((user && user?.role === Role.Moderator) || user?.role === Role.Admin) {
      response.author = media.author;
    }

    return res.json(response);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get media file by ID',
    description:
      'Retrieves and serves the actual media file (image or PDF) by its ID.',
  })
  async getMediaById(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.getFilebyId(id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (!media.fileBuffer || !media.filetype) {
      return res.status(500).json({ message: 'Invalid media data' });
    }

    res.set('Content-Type', media.filetype);

    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    res.set('Accept-Ranges', 'bytes');

    res.set('Content-Disposition', `inline; filename="${media.filename}"`);

    return res.send(media.fileBuffer);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a media file',
    description: 'Deletes a specific media file. Only accessible to Admins.',
  })
  @Auth('Admin')
  async deleteMediaById(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.deleteMediaById(id);
    if (!media.affected) {
      throw new BadRequestException('Media not found');
    }
    return res.json({
      success: true,
      message: 'Media deleted successfully',
    });
  }
}
