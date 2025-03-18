/*
  Warnings:

  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `customers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- DropIndex
DROP INDEX "customers_deleted_at_idx";

-- AlterTable
ALTER TABLE "customers" DROP CONSTRAINT "customers_pkey",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("user_id");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
