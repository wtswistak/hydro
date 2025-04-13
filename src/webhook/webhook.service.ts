import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';
import { AlchemyAddressActivityDto } from './dto/AlchemyAddressActivityDto';
import { BalanceService } from 'src/balance/balance.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoingeckoService } from 'src/coingecko/coingecko.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly balanceService: BalanceService,
    private readonly blockchainService: BlockchainService,
    private readonly coingeckoService: CoingeckoService,
  ) {}
  async handleAlchemyWebhook(
    payload: AlchemyAddressActivityDto,
  ): Promise<void> {
    this.logger.log(
      `Handling Alchemy webhook for event: ${payload.type}, tx hash: ${payload.event.activity[0].hash}`,
    );
    const { activity } = payload.event;
    const existingTx = await this.transactionService.getTxByHash({
      hash: activity[0].hash,
    });
    if (existingTx) {
      this.logger.log(
        `Transaction already exists with hash: ${activity[0].hash}`,
      );
      return;
    }

    await this.prisma.$transaction(async (prismaTx) => {
      let receiverBalanceId = null;
      const cryptoToken = await prismaTx.cryptoToken.findUnique({
        where: { symbol: activity[0].asset },
      });
      if (!cryptoToken) {
        this.logger.error(
          `Crypto token not found for symbol: ${activity[0].asset}`,
        );
        return;
      }

      this.logger.log(
        `Checking if receiver wallet exists for address: ${activity[0].toAddress}`,
      );
      const receiverWallet = await this.walletService.getWalletByAddress(
        {
          address: activity[0].toAddress,
        },
        prismaTx,
      );
      if (receiverWallet) {
        const receiverBalance = await this.balanceService.getBalanceByWalletId(
          {
            walletId: receiverWallet.id,
            cryptoTokenId: cryptoToken.id,
          },
          prismaTx,
        );
        receiverBalanceId = receiverBalance.id;
        this.logger.log(
          `Receiver balance found for wallet id: ${receiverWallet.id}, with amount: ${activity[0].value}`,
        );
        const newBalance = await this.balanceService.updateBalance(
          {
            balanceId: receiverBalance.id,
            amount: activity[0].value,
          },
          prismaTx,
        );
        this.logger.log(
          `Receiver balance updated id: ${newBalance.id}, new amount: ${newBalance.amount}`,
        );
      }

      const tx = await this.transactionService.createTx(
        {
          hash: activity[0].hash,
          senderAddress: activity[0].fromAddress,
          receiverAddress: activity[0].toAddress,
          amount: new Prisma.Decimal(activity[0].value),
          status: TransactionStatus.SUCCESS,
          ...(receiverBalanceId && {
            receiverBalanceId,
          }),
        },
        prismaTx,
      );
      this.logger.log(`Transaction created with id: ${tx.id}`);

      const txReceipt = await this.blockchainService.getTransactionReceipt({
        txHash: activity[0].hash,
      });

      const ethFee = this.blockchainService.calculateFee({
        gasUsed: txReceipt.gasUsed,
        gasPrice: txReceipt.gasPrice,
      });
      const rate = await this.coingeckoService.getCryptocurrencyRate({
        id: 'ethereum',
      });
      const fiatFee = ethFee * rate;
      await this.transactionService.updateTxDetails({
        txId: tx.id,
        data: {
          gasUsed: txReceipt.gasUsed,
          gasPrice: txReceipt.gasPrice,
          cryptoFee: new Prisma.Decimal(ethFee),
          fiatFee: new Prisma.Decimal(fiatFee),
        },
      });
      this.logger.log(`Transaction fee details updated for tx id: ${tx.id}`);
    });
  }
}

// "webhookId":"wh_9y7crs52n47xqk6s",
// "id":"whevt_ttjn9wnlkjkow3f3",
// "createdAt":"2025-04-06T16:26:38.580Z",
// "type":"ADDRESS_ACTIVITY",
// "event":
//   {
//     "network":"ETH_SEPOLIA",
//     "activity":[{
//       "fromAddress":"0x2e698fcd633df16411f9f4b1709442da36056b0e",
//       "toAddress":"0x6df4be74aeb8d48f740f3396a65175ce9dcd3a21",
//       "blockNum":"0x7b0cf5",
//       "hash":"0x60bd4df90dff08db9c34edeb83f04cb06e49da60338e27435748a2cf0bf18b7f",
//       "value":0.001,
//       "asset":"ETH",
//       "category":"external",
//       "rawContract":
//         {
//           "rawValue":"0x38d7ea4c68000",
//           "decimals":18
//         }
//       }]
//       ,"source":"chainlake-kafka"
//     }
