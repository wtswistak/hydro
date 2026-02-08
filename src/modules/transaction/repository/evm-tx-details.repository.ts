import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { CreateEvmDetailsData, UpdateEvmDetailsData } from '../types/evm-details.types';

@Injectable()
export class EvmTxDetailsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvmTxDetails(
    data: CreateEvmDetailsData,
    prismaTx: PrismaClient = this.prisma,
  ) {
    return prismaTx.evmTxDetails.create({
      data: {
        transactionId: data.transactionId,
        nonce: data.nonce,
        gasLimit: data.gasLimit,
        gasPrice: data.gasPrice,
        effectiveGasPrice: data.effectiveGasPrice,
        gasUsed: data.gasUsed,
      },
    });
  }

  async updateEvmTxDetails(
    transactionId: number,
    data: UpdateEvmDetailsData,
    prismaTx: PrismaClient = this.prisma,
  ) {
    return prismaTx.evmTxDetails.update({
      where: { transactionId },
      data,
    });
  }

  async getEvmTxDetails(
    transactionId: number,
    prismaTx: PrismaClient = this.prisma,
  ) {
    return prismaTx.evmTxDetails.findUnique({
      where: { transactionId },
    });
  }
}
