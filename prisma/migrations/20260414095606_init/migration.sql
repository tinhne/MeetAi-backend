-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
