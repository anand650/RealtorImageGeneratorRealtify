/*
  Warnings:

  - You are about to drop the column `stripeInvoiceId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `tenants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paddleInvoiceId]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paddleCustomerId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paddleSubscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paddleCustomerId]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paddleSubscriptionId]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paddleInvoiceId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paddleCustomerId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."invoices_stripeInvoiceId_key";

-- DropIndex
DROP INDEX "public"."subscriptions_stripeCustomerId_key";

-- DropIndex
DROP INDEX "public"."subscriptions_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "public"."tenants_stripeCustomerId_key";

-- DropIndex
DROP INDEX "public"."tenants_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "stripeInvoiceId",
ADD COLUMN     "paddleInvoiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "paddleCustomerId" TEXT NOT NULL,
ADD COLUMN     "paddlePriceId" TEXT,
ADD COLUMN     "paddleSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "paddleCustomerId" TEXT,
ADD COLUMN     "paddlePriceId" TEXT,
ADD COLUMN     "paddleSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_paddleInvoiceId_key" ON "invoices"("paddleInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paddleCustomerId_key" ON "subscriptions"("paddleCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paddleSubscriptionId_key" ON "subscriptions"("paddleSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_paddleCustomerId_key" ON "tenants"("paddleCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_paddleSubscriptionId_key" ON "tenants"("paddleSubscriptionId");
