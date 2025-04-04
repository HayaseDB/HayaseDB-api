import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/module/users/users.service';

interface JwtPayload {
	sub: string;
	[key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly usersService: UsersService,
		configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>('jwt.secret'),
		});
	}

	async validate(payload: JwtPayload) {
		const user = await this.usersService.findOne(payload.sub);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}
}
