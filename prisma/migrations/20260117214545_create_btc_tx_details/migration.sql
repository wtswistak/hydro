-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_blockchain_id_fkey";

-- DropIndex
DROP INDEX "fee_snapshot_created_at_idx";

-- AlterTable
ALTER TABLE "evm_tx_details" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "blockchain_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "btc_tx_details" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "vsize" INTEGER,
    "weight" INTEGER,
    "fee_rate" DOUBLE PRECISION,
    "fee_satoshis" BIGINT,
    "confirmations" INTEGER DEFAULT 0,
    "inputs" JSONB,
    "outputs" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "btc_tx_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "btc_tx_details_transaction_id_key" ON "btc_tx_details"("transaction_id");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "btc_tx_details" ADD CONSTRAINT "btc_tx_details_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
