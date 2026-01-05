-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paidVia" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceDevice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "ipAddress" TEXT,
    "port" INTEGER,
    "branchId" TEXT NOT NULL,
    "apiKey" TEXT,
    "lastSync" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "manufacturer" TEXT,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceDeviceLog" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "employeeId" TEXT,
    "externalUserId" TEXT,
    "punchTime" TIMESTAMP(3) NOT NULL,
    "punchType" TEXT NOT NULL,
    "verifyMode" TEXT,
    "rawData" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "attendanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceDeviceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDeviceMapping" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDeviceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankIntegration" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "branchId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "testMode" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBankAccount" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'savings',
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTransaction" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "bankIntegrationId" TEXT,
    "employeeBankId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionRef" TEXT,
    "bankResponse" JSONB,
    "errorMessage" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");

-- CreateIndex
CREATE INDEX "SystemSettings_isPublic_idx" ON "SystemSettings"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDevice_serialNumber_key" ON "AttendanceDevice"("serialNumber");

-- CreateIndex
CREATE INDEX "AttendanceDevice_branchId_idx" ON "AttendanceDevice"("branchId");

-- CreateIndex
CREATE INDEX "AttendanceDevice_status_idx" ON "AttendanceDevice"("status");

-- CreateIndex
CREATE INDEX "AttendanceDeviceLog_deviceId_idx" ON "AttendanceDeviceLog"("deviceId");

-- CreateIndex
CREATE INDEX "AttendanceDeviceLog_employeeId_idx" ON "AttendanceDeviceLog"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceDeviceLog_punchTime_idx" ON "AttendanceDeviceLog"("punchTime");

-- CreateIndex
CREATE INDEX "AttendanceDeviceLog_processed_idx" ON "AttendanceDeviceLog"("processed");

-- CreateIndex
CREATE INDEX "EmployeeDeviceMapping_employeeId_idx" ON "EmployeeDeviceMapping"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDeviceMapping_deviceId_externalUserId_key" ON "EmployeeDeviceMapping"("deviceId", "externalUserId");

-- CreateIndex
CREATE INDEX "BankIntegration_branchId_idx" ON "BankIntegration"("branchId");

-- CreateIndex
CREATE INDEX "BankIntegration_isActive_idx" ON "BankIntegration"("isActive");

-- CreateIndex
CREATE INDEX "EmployeeBankAccount_employeeId_idx" ON "EmployeeBankAccount"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollTransaction_payrollId_idx" ON "PayrollTransaction"("payrollId");

-- CreateIndex
CREATE INDEX "PayrollTransaction_status_idx" ON "PayrollTransaction"("status");

-- CreateIndex
CREATE INDEX "PayrollTransaction_initiatedAt_idx" ON "PayrollTransaction"("initiatedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Payroll_status_idx" ON "Payroll"("status");

-- AddForeignKey
ALTER TABLE "AttendanceDevice" ADD CONSTRAINT "AttendanceDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDeviceLog" ADD CONSTRAINT "AttendanceDeviceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AttendanceDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDeviceLog" ADD CONSTRAINT "AttendanceDeviceLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDeviceMapping" ADD CONSTRAINT "EmployeeDeviceMapping_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDeviceMapping" ADD CONSTRAINT "EmployeeDeviceMapping_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AttendanceDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankIntegration" ADD CONSTRAINT "BankIntegration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBankAccount" ADD CONSTRAINT "EmployeeBankAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_bankIntegrationId_fkey" FOREIGN KEY ("bankIntegrationId") REFERENCES "BankIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_employeeBankId_fkey" FOREIGN KEY ("employeeBankId") REFERENCES "EmployeeBankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
