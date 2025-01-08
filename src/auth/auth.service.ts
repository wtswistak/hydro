import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserExistsException } from './exceptions/user-exists-exception';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
}
