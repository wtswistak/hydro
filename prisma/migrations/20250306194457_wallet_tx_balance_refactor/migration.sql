/*
  Warnings:

  - You are about to alter the column `amount` on the `balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(36,18)`.
  - You are about to drop the column `balance_id` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `chainId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `receiverAddress` on the `transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(36,18)`.
  - You are about to drop the `token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_crypto_token` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receiver_address` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_address` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "token" DROP CONSTRAINT "token_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_balance_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_crypto_token" DROP CONSTRAINT "wallet_crypto_token_crypto_token_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_crypto_token" DROP CONSTRAINT "wallet_crypto_token_wallet_id_fkey";

-- AlterTable
ALTER TABLE "balance" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(36,18);

-- AlterTable
ALTER TABLE "blockchain" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "balance_id",
DROP COLUMN "chainId",
DROP COLUMN "receiverAddress",
ADD COLUMN     "block_number" INTEGER,
ADD COLUMN     "gas_limit" BIGINT,
ADD COLUMN     "gas_price" DECIMAL(65,30),
ADD COLUMN     "nonce" INTEGER,
ADD COLUMN     "receiver_address" TEXT NOT NULL,
ADD COLUMN     "receiver_balance_id" INTEGER,
ADD COLUMN     "sender_address" TEXT NOT NULL,
ADD COLUMN     "sender_balance_id" INTEGER,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(36,18),
ALTER COLUMN "hash" DROP NOT NULL;

-- DropTable
DROP TABLE "token";

-- DropTable
DROP TABLE "wallet_crypto_token";

-- CreateTable
CREATE TABLE "session_token" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_token_key" ON "session_token"("token");

-- AddForeignKey
ALTER TABLE "session_token" ADD CONSTRAINT "session_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_sender_balance_id_fkey" FOREIGN KEY ("sender_balance_id") REFERENCES "balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_receiver_balance_id_fkey" FOREIGN KEY ("receiver_balance_id") REFERENCES "balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
