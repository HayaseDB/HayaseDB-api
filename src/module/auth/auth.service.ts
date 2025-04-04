import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@/module/users/entities/user.entity';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Validate user credentials and return JWT token.
	 */
	async login(
		email: string,
		password: string,
	): Promise<{ accessToken: string; userId: string }> {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Invalid email or password');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid email or password');
		}

		return { accessToken: this.generateToken(user), userId: user.id };
	}

	/**
	 * Register a new user, hash password, and return user data.
	 */
	async register(email: string, password: string): Promise<User> {
		const existingUser = await this.usersService.findByEmail(email);
		if (existingUser) {
			throw new ConflictException('Email already in use');
		}

		return await this.usersService.create(email, password);
	}

	/**
	 * Generate a JWT token for the user.
	 */
	private generateToken(user: User): string {
		const payload = { id: user.id, email: user.email };
		return this.jwtService.sign(payload);
	}
}
