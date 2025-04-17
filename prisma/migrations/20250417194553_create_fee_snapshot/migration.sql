-- CreateTable
CREATE TABLE "FeeSnapshot" (
    "id" SERIAL NOT NULL,
    "block_number" BIGINT NOT NULL,
    "base_fee_per_gas" BIGINT NOT NULL,
    "gas_used_ratio" DOUBLE PRECISION NOT NULL,
    "priority_fee_10" BIGINT NOT NULL,
    "priority_fee_50" BIGINT NOT NULL,
    "priority_fee_90" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeSnapshot_pkey" PRIMARY KEY ("id")
);
