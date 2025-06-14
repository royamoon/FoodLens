import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login/google')
  async loginWithGoogle(@Body() body: { redirectUri?: string }) {
    return this.authService.loginWithGoogle(body.redirectUri);
  }

  @Post('auth/callback')
  async authCallback(@Body() body: { access_token: string; refresh_token?: string }) {
    return this.authService.handleOAuthCallback(body.access_token, body.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader.substring(7);
    return this.authService.logout(token);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('verify')
  @UseGuards(AuthGuard)
  async verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
    };
  }
} 