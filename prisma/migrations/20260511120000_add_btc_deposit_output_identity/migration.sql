-- Allow multiple application records for one BTC transaction hash.
DROP INDEX IF EXISTS "transaction_hash_key";

CREATE INDEX IF NOT EXISTS "transaction_hash_idx" ON "transaction"("hash");

ALTER TABLE "btc_tx_details"
  ADD COLUMN "txid" TEXT,
  ADD COLUMN "vout" INTEGER;

CREATE UNIQUE INDEX "btc_tx_details_txid_vout_key"
  ON "btc_tx_details"("txid", "vout");
