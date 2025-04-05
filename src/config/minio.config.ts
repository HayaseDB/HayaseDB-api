import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('minio', () => {
  const configService = new ConfigService();

  return {
    endPoint: configService.get<number>('MINIO_ENDPOINT'),
    port: configService.get<number>('MINIO_PORT'),
    accessKey: configService.get<number>('MINIO_ACCESS_KEY'),
    secretKey: configService.get<number>('MINIO_SECRET_KEY'),
  };
});
