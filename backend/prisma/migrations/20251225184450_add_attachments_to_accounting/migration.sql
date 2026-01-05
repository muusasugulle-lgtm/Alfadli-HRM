-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;
