import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  name: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_USER_PWD,
}));
