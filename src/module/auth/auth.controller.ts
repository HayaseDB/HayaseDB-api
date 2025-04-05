import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth, GetUser } from '@/module/auth/auth.decorator';
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
      accessToken: loginResult.accessToken,
      userId: loginResult.userId,
      username: loginResult.username,
    };
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  @Auth()
  me(@GetUser() user: User) {
    return {
      message: 'User details retrieved successfully',
      user: {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
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
}
