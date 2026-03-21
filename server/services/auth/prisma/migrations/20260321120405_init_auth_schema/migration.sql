-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('DOMESTIC', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SERVICE', 'BILLING');

-- CreateTable
CREATE TABLE "User" (
    "consumerId" CHAR(8) NOT NULL,
    "fullName" VARCHAR(30) NOT NULL,
    "dob" DATE NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "mobile" CHAR(10) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "connectionType" "ConnectionType" NOT NULL DEFAULT 'DOMESTIC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("consumerId")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "consumerId" CHAR(8) NOT NULL,
    "token" VARCHAR(256) NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "consumerId" CHAR(8) NOT NULL,
    "addressType" "AddressType" NOT NULL DEFAULT 'SERVICE',
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT NOT NULL,
    "pincode" VARCHAR(6) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Address_consumerId_addressType_isDefault_key" ON "Address"("consumerId", "addressType", "isDefault");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "User"("consumerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "User"("consumerId") ON DELETE CASCADE ON UPDATE CASCADE;
