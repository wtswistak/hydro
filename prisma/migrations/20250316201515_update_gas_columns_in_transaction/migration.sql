/*
  Warnings:

  - You are about to alter the column `gas_price` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - A unique constraint covering the columns `[name]` on the table `crypto_token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "gas_Used" BIGINT,
ALTER COLUMN "gas_price" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "crypto_token_name_key" ON "crypto_token"("name");
