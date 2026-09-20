-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('NONE', 'SAFEPAY', 'GOOGLE');

-- CreateEnum
CREATE TYPE "SafepayStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('HAIRSTYLE', 'BEARD', 'OUTFIT', 'AGE', 'HAIRCOLOR', 'IMAGEGEN');

-- CreateEnum
CREATE TYPE "CreditReason" AS ENUM ('SIGNUP_BONUS', 'SUBSCRIPTION', 'USAGE', 'REFUND', 'MONTHLY_RESET', 'ADMIN_GRANT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 4,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NONE',
    "planStartedAt" TIMESTAMP(3),
    "planExpiresAt" TIMESTAMP(3),
    "nextRenewalAt" TIMESTAMP(3),
    "revenuecatAppUserId" TEXT,
    "googlePlayToken" TEXT,
    "googlePlayProductId" TEXT,
    "totalGenerations" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafepaySubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "safepayCustomerId" TEXT,
    "safepaySubscriptionId" TEXT,
    "safepayTrackerId" TEXT,
    "safepayPlanId" TEXT,
    "planType" "PlanType" NOT NULL,
    "status" "SafepayStatus" NOT NULL DEFAULT 'ACTIVE',
    "amount" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStart" TIMESTAMP(3),
    "currentEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafepaySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "FeatureType" NOT NULL,
    "imageUrl" TEXT,
    "originalImageUrl" TEXT,
    "prompt" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "taskId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "CreditReason" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_revenuecatAppUserId_key" ON "User"("revenuecatAppUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googlePlayToken_key" ON "User"("googlePlayToken");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- CreateIndex
CREATE INDEX "User_paymentProvider_idx" ON "User"("paymentProvider");

-- CreateIndex
CREATE UNIQUE INDEX "SafepaySubscription_safepaySubscriptionId_key" ON "SafepaySubscription"("safepaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SafepaySubscription_safepayTrackerId_key" ON "SafepaySubscription"("safepayTrackerId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_userId_idx" ON "SafepaySubscription"("userId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_safepaySubscriptionId_idx" ON "SafepaySubscription"("safepaySubscriptionId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_status_idx" ON "SafepaySubscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Creation_taskId_key" ON "Creation"("taskId");

-- CreateIndex
CREATE INDEX "Creation_userId_idx" ON "Creation"("userId");

-- CreateIndex
CREATE INDEX "Creation_feature_idx" ON "Creation"("feature");

-- CreateIndex
CREATE INDEX "Creation_status_idx" ON "Creation"("status");

-- CreateIndex
CREATE INDEX "Creation_createdAt_idx" ON "Creation"("createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_reason_idx" ON "CreditTransaction"("reason");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "SafepaySubscription" ADD CONSTRAINT "SafepaySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creation" ADD CONSTRAINT "Creation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
