/*
  Multi-chain Transaction Refactor (EVM split)
  blockchain_id will be NOT NULL
*/

-- 1) Create enum for blockchain type
CREATE TYPE "BlockchainType" AS ENUM ('EVM');

-- 2) Alter blockchain table
ALTER TABLE "blockchain"
  ADD COLUMN "type" "BlockchainType" NOT NULL DEFAULT 'EVM';

ALTER TABLE "blockchain"
  ALTER COLUMN "chain_id" DROP NOT NULL;

-- 3) Create evm_tx_details
CREATE TABLE "evm_tx_details" (
  "id" SERIAL NOT NULL,
  "transaction_id" INTEGER NOT NULL,
  "nonce" INTEGER,
  "gas_limit" BIGINT,
  "gas_price" BIGINT,
  "effective_gas_price" BIGINT,
  "gas_used" BIGINT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "evm_tx_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "evm_tx_details_transaction_id_key"
  ON "evm_tx_details"("transaction_id");

ALTER TABLE "evm_tx_details"
  ADD CONSTRAINT "evm_tx_details_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) Backfill EVM data
INSERT INTO "evm_tx_details"
  ("transaction_id", "nonce", "gas_limit", "gas_price", "gas_used", "created_at", "updated_at")
SELECT
  t."id",
  t."nonce",
  t."gas_limit",
  t."gas_price",
  t."gas_used",
  t."created_at",
  t."updated_at"
FROM "transaction" t
WHERE t."nonce" IS NOT NULL
   OR t."gas_limit" IS NOT NULL
   OR t."gas_price" IS NOT NULL
   OR t."gas_used" IS NOT NULL;

-- 5) Add blockchain_id + block_ref as nullable (TEMPORARY)
ALTER TABLE "transaction"
  ADD COLUMN "blockchain_id" INTEGER,
  ADD COLUMN "block_ref" BIGINT;

-- 6) Copy block_number -> block_ref
UPDATE "transaction"
SET "block_ref" = "block_number"
WHERE "block_number" IS NOT NULL;

ALTER TABLE "transaction"
  DROP COLUMN "block_number";

-- 7) Populate blockchain_id via sender balance
UPDATE "transaction" t
SET "blockchain_id" = w."blockchain_id"
FROM "balance" b
JOIN "wallet" w ON w."id" = b."wallet_id"
WHERE t."sender_balance_id" = b."id"
  AND t."blockchain_id" IS NULL;

-- 8) Fallback via receiver balance
UPDATE "transaction" t
SET "blockchain_id" = w."blockchain_id"
FROM "balance" b
JOIN "wallet" w ON w."id" = b."wallet_id"
WHERE t."receiver_balance_id" = b."id"
  AND t."blockchain_id" IS NULL;

-- 9) FINAL fallback — assign default blockchain (REQUIRED)
-- ⚠️ Only safe if all legacy tx are from one chain
UPDATE "transaction"
SET "blockchain_id" = (
  SELECT id FROM "blockchain" ORDER BY id LIMIT 1
)
WHERE "blockchain_id" IS NULL;

-- 10) Enforce NOT NULL
ALTER TABLE "transaction"
  ALTER COLUMN "blockchain_id" SET NOT NULL;

-- 11) Drop old EVM columns
ALTER TABLE "transaction"
  DROP COLUMN "nonce",
  DROP COLUMN "gas_limit",
  DROP COLUMN "gas_price",
  DROP COLUMN "gas_used";

-- 12) Add FK (now NOT NULL → no SET NULL)
ALTER TABLE "transaction"
  ADD CONSTRAINT "transaction_blockchain_id_fkey"
  FOREIGN KEY ("blockchain_id") REFERENCES "blockchain"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
