/*
  Warnings:

  - You are about to drop the column `gas_Used` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "gas_Used",
ADD COLUMN     "crypto_fee" DECIMAL(65,30),
ADD COLUMN     "fiat_fee" DECIMAL(65,30),
ADD COLUMN     "gas_used" BIGINT;
