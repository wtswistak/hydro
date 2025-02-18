-- CreateTable
CREATE TABLE "wallet_crypto_token" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "crypto_token_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "wallet_crypto_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_crypto_token_wallet_id_crypto_token_id_key" ON "wallet_crypto_token"("wallet_id", "crypto_token_id");

-- AddForeignKey
ALTER TABLE "wallet_crypto_token" ADD CONSTRAINT "wallet_crypto_token_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_crypto_token" ADD CONSTRAINT "wallet_crypto_token_crypto_token_id_fkey" FOREIGN KEY ("crypto_token_id") REFERENCES "crypto_token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
