import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type PrismaClient = PrismaService | Prisma.TransactionClient;
