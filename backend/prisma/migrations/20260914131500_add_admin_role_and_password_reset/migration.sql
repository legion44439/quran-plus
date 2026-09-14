-- AlterEnum: add admin between moderator and superadmin
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'admin' AFTER 'moderator';

-- AlterTable: password reset token fields on User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);
