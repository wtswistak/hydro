import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserExistsException } from './exception/user-exists.exception';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserNotExistsException } from './exception/user-not-exists.exception';
import { InvalidPasswordException } from './exception/invalid-password.exception';
import { User } from '@prisma/client';
import { LoginResponseDto } from './dto/login-response.dto';
import { NotificationService } from 'src/notification/notification.service';

interface TokenPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  private async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register({ email, password }: RegisterDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw new UserExistsException();
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const verificationToken = await bcrypt.hash(email, 10);
    this.notificationService.sendVerificationEmail({
      email,
      token: verificationToken,
    });
    return this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });
  }

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UserNotExistsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    return tokens;
  }

  async changePassword(
    userId: number,
    { password, newPassword }: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UserNotExistsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);

    this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashPassword,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(
      refreshToken,
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );
    const storedToken = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
    });

    await this.prisma.token.update({
      where: { id: storedToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  logout(refreshToken: string) {
    this.prisma.token.update({
      where: { token: refreshToken },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
