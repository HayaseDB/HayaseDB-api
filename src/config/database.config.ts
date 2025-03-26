import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  port: process.env.DATABASE_PORT,
  url:
    process.env.DATABASE_URL ||
    `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNC ?? false,
  logging: process.env.DATABASE_LOGGING ?? false,
}));
