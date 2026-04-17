-- AlterEnum
ALTER TYPE "AuthProvider" ADD VALUE 'GITHUB';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "exprireAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
