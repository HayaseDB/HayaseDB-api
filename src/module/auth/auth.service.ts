import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@/module/users/entities/user.entity';
import { MailerService } from '../mailer/mailer.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Validate user credentials and return JWT token.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    userId: string;
    username: string;
    email: string;
  }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.verified) {
      throw new UnauthorizedException('Email not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      token: this.generateToken(user),
      email: user.email,
      userId: user.id,
      username: user.username,
    };
  }
  /**
   * Register a new user, hash password, and send verification email.
   * Uses a transaction to ensure both operations succeed or fail together.
   */
  async register(email: string, password: string): Promise<User> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      try {
        const newUser = new User();
        newUser.email = email;
        newUser.password = await bcrypt.hash(password, 10);

        newUser.setDefaultUsername();

        const savedUser = await transactionalEntityManager.save(User, newUser);

        const verificationToken = this.generateVerificationToken(savedUser);

        await this.mailerService.sendVerificationEmail(
          savedUser.email,
          verificationToken,
        );

        return savedUser;
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to register user: ' + error.message,
        );
      }
    });
  }

  /**
   * Verify the user using the verification token.
   */
  async verifyUserWithToken(token: string): Promise<string> {
    const decoded = this.jwtService.verify<{ userId: string; type: string }>(
      token,
    );

    if (decoded.type !== 'verify') {
      throw new BadRequestException('Invalid verification token');
    }

    const user = await this.usersService.findOne(decoded.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.verifyUser(user.id);

    return 'User verified successfully';
  }

  /**
   * Resend verify email
   */
  async resendVerifyByEmail(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    if (existingUser.verified) {
      throw new BadRequestException('User already verified');
    }

    const verificationToken = this.generateVerificationToken(existingUser);

    await this.mailerService.sendVerificationEmail(
      existingUser.email,
      verificationToken,
    );
    return {
      success: true,
      message: 'Successfully Send Verification Email',
    };
  }

  /**
   * Generate a JWT token for authentication.
   * This token is used for login sessions.
   */
  private generateToken(user: User): string {
    const payload = { userId: user.id, type: 'auth' };
    return this.jwtService.sign(payload);
  }

  /**
   * Generate a JWT token for email verification.
   * This token is used to verify the user's email address.
   */
  private generateVerificationToken(user: User): string {
    const payload = { userId: user.id, type: 'verify' };
    return this.jwtService.sign(payload);
  }
}
