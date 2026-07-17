-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comboItems" JSONB,
ADD COLUMN     "variantType" TEXT NOT NULL DEFAULT 'single';
