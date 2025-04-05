import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post, Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { Auth } from '@/module/auth/auth.decorator';
import { MinioService } from "@/module/minio/minio.service";
import { Response } from 'express';

@Controller('media')
@ApiTags('Media')
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
        private readonly minioService: MinioService,
    ) {}

    @Post()
    @Auth('User')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Upload media file with type and role',
        type: CreateMediaDto,
    })
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true,
    })
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() createMediaDto: CreateMediaDto,
    ) {
        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        try {
            return await this.mediaService.uploadMedia(createMediaDto, file);
        } catch {
            throw new HttpException(
                'Failed to upload media',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @Auth('User')
    async getMedia(@Param('id') id: string) {
        try {
            return await this.mediaService.getMediaById(id);
        } catch {
            throw new HttpException('Media not found', HttpStatus.NOT_FOUND);
        }
    }

    @Get('view/:id')
    @Auth('User')
    async viewMedia(@Param('id') id: string, @Res() res: Response) {
        try {
            const media = await this.mediaService.getMediaById(id);
            const fileBuffer = await this.minioService.getFile('media', media.key);
            res.setHeader('Content-Type', media.mimeType);
            res.setHeader('Content-Length', fileBuffer.length.toString());
            res.end(fileBuffer);
        } catch {
            throw new HttpException('Error viewing media', HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    @Auth('Admin')
    async deleteMedia(@Param('id') id: string) {
        try {
            await this.mediaService.deleteMedia(id);
            return { message: 'Media deleted successfully' };
        } catch {
            throw new HttpException('Error deleting media', HttpStatus.NOT_FOUND);
        }
    }
}
