import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
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
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AppConfigService } from 'src/config/app-config.service';
import { REFRESH_TOKEN_EXPIRES_TIME } from 'src/utils/constant';

interface TokenPayload {
  sub: number;
  email: string;
}

interface CreateToken {
  userId: number;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly configService: AppConfigService,
  ) {}

  private async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.accessToken,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.refreshToken,
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

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresTime = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresTime);

    const result = await this.prisma.$transaction(async (prisma) => {
      this.logger.log(`Creating user with email: ${email}`);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashPassword,
        },
      });

      await prisma.emailVerification.create({
        data: {
          token: verificationToken,
          expiresAt,
          userId: newUser.id,
        },
      });

      return newUser;
    });

    this.logger.log(`Sending verification email to ${email}`);
    this.notificationService.sendVerificationEmail({
      email,
      token: verificationToken,
    });

    return result;
  }

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Logging in user with email: ${email}`);
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

    await this.createToken({ userId: user.id, token: tokens.refreshToken });
    this.logger.log(`User logged in: ${user.id}`);

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
    this.logger.log(`Changing password for user: ${userId}`);

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
        secret: this.configService.refreshToken,
      },
    );

    return this.prisma.$transaction(async (tx) => {
      const storedToken = await tx.token.findUnique({
        where: { token: refreshToken },
      });

      if (
        !storedToken ||
        storedToken.revokedAt ||
        storedToken.expiresAt < new Date() ||
        storedToken.userId !== payload.sub
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens({
        sub: payload.sub,
        email: payload.email,
      });
      this.logger.log(`Refreshing token for user: ${payload.sub}`);

      await tx.token.update({
        where: { token: refreshToken },
        data: {
          revokedAt: new Date(),
        },
      });

      await tx.token.create({
        data: {
          token: tokens.refreshToken,
          userId: payload.sub,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_TIME),
        },
      });

      return tokens;
    });
  }

  async logout(refreshToken: string) {
    const token = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    this.prisma.token.update({
      where: { token: refreshToken },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const result = await this.prisma.$transaction(async (prisma) => {
      const emailVerification = await prisma.emailVerification.findUnique({
        where: {
          token,
          used: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      if (!emailVerification) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const user = await prisma.user.update({
        where: { id: emailVerification.userId },
        data: { emailVerified: true },
      });

      await prisma.emailVerification.update({
        where: { id: emailVerification.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      return user;
    });
    this.logger.log(`Email verified for user: ${result.id}`);
  }

  createToken({ userId, token }: CreateToken) {
    return this.prisma.token.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_TIME),
      },
    });
  }
}
