import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth, GetUser } from '@/module/auth/decorator/auth.decorator';
import { User } from '@/module/users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user and returns a JWT token along with user information.',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const loginResult = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    return {
      message: 'Login Successfully',
      token: loginResult.token,
      userId: loginResult.userId,
      email: loginResult.email,
      username: loginResult.username,
    };
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description:
      "Registers a new user and returns the created user's basic information.",
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
    );

    return {
      message: 'User registered successfully',
      userId: user.id,
      email: user.email,
      username: user.username,
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Returns the authenticated user's profile information based on the provided JWT token.",
  })
  @HttpCode(HttpStatus.OK)
  @Auth()
  me(@GetUser() user: User) {
    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    return {
      message: 'User details retrieved successfully',
      user: {
        pfp: user.pfp,
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  @Get('verify')
  @ApiOperation({
    summary: 'Verify user email',
    description:
      "Verifies a user's email address using a provided verification token.",
  })
  @HttpCode(HttpStatus.OK)
  async verify(@Query('token') token: string) {
    const message = await this.authService.verifyUserWithToken(token);
    return {
      message,
    };
  }

  @Get('verify/resend')
  @ApiOperation({
    summary: 'Resend email verification',
    description:
      "Resends the email verification link to the user's email address.",
  })
  @HttpCode(HttpStatus.OK)
  async resend(@Query('email') email: string) {
    return await this.authService.resendVerifyByEmail(email);
  }
}
