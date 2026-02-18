-- AlterTable
ALTER TABLE "balance" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "blockchain" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "crypto_token" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "email_verification" ALTER COLUMN "usedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "session_token" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "revoked_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "wallet" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(3);
