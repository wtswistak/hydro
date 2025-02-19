/*
  Warnings:

  - A unique constraint covering the columns `[wallet_id,cryptoToken_id]` on the table `balance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockchain_id` to the `crypto_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockchain_id` to the `wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "crypto_token" ADD COLUMN     "blockchain_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "wallet" ADD COLUMN     "blockchain_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "blockchain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "chain_id" BIGINT NOT NULL,
    "native_symbol" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "blockchain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_name_key" ON "blockchain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_chain_id_key" ON "blockchain"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "balance_wallet_id_cryptoToken_id_key" ON "balance"("wallet_id", "cryptoToken_id");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_token" ADD CONSTRAINT "crypto_token_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
