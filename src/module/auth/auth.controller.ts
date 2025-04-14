import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  @HttpCode(HttpStatus.OK)
  @Auth()
  me(@GetUser() user: User) {
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
  @HttpCode(HttpStatus.OK)
  async verify(@Query('token') token: string) {
    const message = await this.authService.verifyUserWithToken(token);
    return {
      message,
    };
  }

  @Get('verify/resend')
  @HttpCode(HttpStatus.OK)
  async resend(@Query('email') email: string) {
    return await this.authService.resendVerifyByEmail(email);
  }
}
