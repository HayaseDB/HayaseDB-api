import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export default registerAs('jwt', () => {
  const configService = new ConfigService();

  return {
    secret: configService.get<string>('JWT_SECRET'),
    expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
  };
});
