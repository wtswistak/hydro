-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;
