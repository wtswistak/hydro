import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
}
