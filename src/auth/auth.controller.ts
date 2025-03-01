import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegisterResponseDto } from './dto/register-response.dto';
import { plainToClass } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Response } from 'express';
import { REFRESH_TOKEN_EXPIRES_TIME } from 'src/utils/constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(registerDto);

    return plainToClass(RegisterResponseDto, user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(loginDto);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRES_TIME,
    });

    res.json(tokens);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@Req() req: any, @Res() res: Response) {
    const refreshToken = req.user.refreshToken;
    const tokens = await this.authService.refreshToken(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRES_TIME,
    });

    res.json(tokens);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ): void {
    const userId = req.user.id;
    this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req: any) {
    const refreshToken = req.cookies.refreshToken;

    return this.authService.logout(refreshToken);
  }

  @Post('verify-email')
  @HttpCode(204)
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): void {
    this.authService.verifyEmail(verifyEmailDto.token);
  }
}
