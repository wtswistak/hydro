/*
  Warnings:

  - You are about to drop the column `wallet_id` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `balance_id` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_wallet_id_fkey";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "wallet_id",
ADD COLUMN     "balance_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "cryptoToken_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_token" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "crypto_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_token_symbol_key" ON "crypto_token"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_token_contract_address_key" ON "crypto_token"("contract_address");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_balance_id_fkey" FOREIGN KEY ("balance_id") REFERENCES "balance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_cryptoToken_id_fkey" FOREIGN KEY ("cryptoToken_id") REFERENCES "crypto_token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
