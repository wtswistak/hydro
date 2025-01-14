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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password }: RegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw new UserExistsException();
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  async login({ email, password }: LoginDto) {
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

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
    };
  }

  async changePassword(userId, { password, newPassword }: ChangePasswordDto) {
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

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashPassword,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Refresh token has expired or is invalid',
      );
    }

    const newAccessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '15m' },
    );

    const newRefreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' },
    );

    await this.prisma.token.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
