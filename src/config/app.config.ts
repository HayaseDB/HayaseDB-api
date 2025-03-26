import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.APP_PORT,
  env: process.env.APP_NODE_ENV ?? 'development',
  base_url: process.env.APP_BASE_URL ?? 'http://localhost',
}));
