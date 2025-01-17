import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
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
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  refreshToken(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.refreshToken(userId);
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
}
