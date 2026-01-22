import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { CreateBtcDetailsData } from "../types/btc-details.types";
import { PrismaClient } from 'src/database/prisma/prisma.type';


@Injectable()
export class BtcTxDetailsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBtcTxDetails(
    data: CreateBtcDetailsData,
    prismaTx: PrismaClient = this.prisma,
  ) {
    return prismaTx.btcTxDetails.create({
      data,
    });
  }
}