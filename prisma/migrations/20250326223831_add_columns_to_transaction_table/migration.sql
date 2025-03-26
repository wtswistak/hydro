/*
  Warnings:

  - You are about to drop the column `gas_Used` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "gas_Used",
ADD COLUMN     "crypto_fee" BIGINT,
ADD COLUMN     "fiat_fee" INTEGER,
ADD COLUMN     "gas_used" BIGINT;
