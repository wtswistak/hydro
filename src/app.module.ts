import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
import { NotificationModule } from './notification/notification.module';
import { MailersendService } from './notification/mailersend.service';
import { BinanceModule } from './binance/binance.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    AppConfigModule,
    NotificationModule,
    BinanceModule,
    CoingeckoModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailersendService],
})
export class AppModule {}
