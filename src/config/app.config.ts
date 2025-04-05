import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const configService = new ConfigService();

  return {
    port: configService.get<string>('APP_PORT'),
    env: configService.get<string>('APP_NODE_ENV'),
    base_url: configService.get<string>('APP_BASE_URL'),
  };
});
