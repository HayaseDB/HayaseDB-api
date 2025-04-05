import { Injectable, Logger } from '@nestjs/common';
import { Client, ClientOptions } from 'minio';
import { ConfigService } from '@nestjs/config';
import * as stream from 'stream';
import * as util from 'util';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Client;

  constructor(private readonly configService: ConfigService) {
    const options: ClientOptions = {
      endPoint: this.configService.getOrThrow<string>('minio.endPoint'),
      port: this.configService.getOrThrow<number>('minio.port'),
      useSSL: false,
      accessKey: this.configService.getOrThrow<string>('minio.accessKey'),
      secretKey: this.configService.getOrThrow<string>('minio.secretKey'),
    };

    this.minioClient = new Client(options);
  }

  async uploadFile(
      bucketName: string,
      fileName: string,
      fileBuffer: Buffer,
  ): Promise<string> {
    try {
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Bucket "${bucketName}" created successfully.`);
      }

      await this.minioClient.putObject(bucketName, fileName, fileBuffer);
      this.logger.log(`Successfully uploaded file: ${fileName}`);

      return `File ${fileName} uploaded successfully`;
    } catch (error) {
      this.logger.error(`Error uploading file: ${fileName}`, error);
      throw new Error('Error uploading file');
    }
  }

  async getFile(bucketName: string, fileName: string): Promise<Buffer> {
    try {
      const fileStream = await this.minioClient.getObject(bucketName, fileName);

      const streamToBuffer = util.promisify(stream.pipeline);
      const chunks: Buffer[] = [];

      await streamToBuffer(
        fileStream,
        new stream.Writable({
          write(chunk, encoding, callback) {
            chunks.push(chunk);
            callback();
          },
        }),
      );

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Error fetching file: ${fileName}`, error);
      throw new Error('Error fetching file');
    }
  }

  async deleteFile(bucketName: string, fileName: string): Promise<string> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      this.logger.log(`Successfully deleted file: ${fileName}`);
      return `File ${fileName} deleted successfully`;
    } catch (error) {
      this.logger.error(`Error deleting file: ${fileName}`, error);
      throw new Error('Error deleting file');
    }
  }
}
