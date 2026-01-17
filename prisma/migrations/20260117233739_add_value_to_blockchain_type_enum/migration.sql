/*
  Warnings:

  - Made the column `blockchain_id` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "BlockchainType" ADD VALUE 'BITCOIN';

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_blockchain_id_fkey";

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "blockchain_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
