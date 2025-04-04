import { ConfigService, registerAs } from '@nestjs/config';

export default registerAs('database', () => {
	const configService = new ConfigService();

	return {
		port: configService.get<number>('DATABASE_PORT'),
		url: `postgres://${configService.get<string>('DATABASE_USERNAME')}:${configService.get<string>('DATABASE_PASSWORD')}@${configService.get<string>('DATABASE_HOST')}:${configService.get<number>('DATABASE_PORT')}/${configService.get<string>('DATABASE_NAME')}`,
		username: configService.get<string>('DATABASE_USERNAME'),
		password: configService.get<string>('DATABASE_PASSWORD'),
		name: configService.get<string>('DATABASE_NAME'),
		synchronize: configService.get<string>('DATABASE_SYNC') === 'true',
		logging: configService.get<string>('DATABASE_LOGGING') === 'true',
	};
});
