/*
  Warnings:

  - You are about to drop the column `cryptoToken_id` on the `balance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wallet_id,crypto_token_id]` on the table `balance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `crypto_token_id` to the `balance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "balance" DROP CONSTRAINT "balance_cryptoToken_id_fkey";

-- DropIndex
DROP INDEX "balance_wallet_id_cryptoToken_id_key";

-- AlterTable
ALTER TABLE "balance" RENAME COLUMN "cryptoToken_id" TO "crypto_token_id";

-- CreateIndex
CREATE INDEX "balance_wallet_id_idx" ON "balance"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "balance_wallet_id_crypto_token_id_key" ON "balance"("wallet_id", "crypto_token_id");

-- CreateIndex
CREATE INDEX "email_verification_user_id_idx" ON "email_verification"("user_id");

-- CreateIndex
CREATE INDEX "session_token_user_id_idx" ON "session_token"("user_id");

-- CreateIndex
CREATE INDEX "transaction_sender_balance_id_idx" ON "transaction"("sender_balance_id");

-- CreateIndex
CREATE INDEX "transaction_receiver_balance_id_idx" ON "transaction"("receiver_balance_id");

-- CreateIndex
CREATE INDEX "transaction_blockchain_id_idx" ON "transaction"("blockchain_id");

-- CreateIndex
CREATE INDEX "wallet_user_id_idx" ON "wallet"("user_id");

-- CreateIndex
CREATE INDEX "wallet_blockchain_id_idx" ON "wallet"("blockchain_id");

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_crypto_token_id_fkey" FOREIGN KEY ("crypto_token_id") REFERENCES "crypto_token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
