ALTER TABLE "btc_tx_details"
  ADD COLUMN "txid" TEXT,
  ADD COLUMN "vout" INTEGER;

CREATE UNIQUE INDEX "btc_tx_details_txid_vout_key"
  ON "btc_tx_details"("txid", "vout");
