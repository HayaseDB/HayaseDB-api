import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('mailer', () => {
  const configService = new ConfigService();

  return {
    password: configService.get<number>('MAILER_PASSWORD'),
    user: configService.get<string>('MAILER_USER'),
    host: configService.get<string>('MAILER_HOST'),
    port: configService.get<number>('MAILER_PORT'),
  };
});
