-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('VISITOR', 'USER', 'PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."DiabetesType" AS ENUM ('TYPE_1', 'TYPE_2', 'GESTATIONAL', 'PREDIABETES', 'INFANTIL');

-- CreateEnum
CREATE TYPE "public"."ProfessionalType" AS ENUM ('DIETISTA', 'NUTRICIONISTA', 'EDUCADOR', 'ENTRENADOR', 'PSICOLOGO', 'MEDICO');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('GUIA', 'LIBRO', 'MENU', 'VIDEO', 'AUDIO', 'DOCUMENTO');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."SessionCategory" AS ENUM ('CONSULTATION', 'INITIAL', 'FOLLOW_UP', 'EMERGENCY', 'EDUCATION', 'NUTRITION', 'PSYCHOLOGY', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."SessionModality" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."NewsletterSource" AS ENUM ('MAINTENANCE_PAGE', 'LANDING_PAGE', 'BLOG', 'SOCIAL_MEDIA', 'REFERRAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professionals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ProfessionalType" NOT NULL,
    "description" TEXT,
    "experience" INTEGER,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "hourlyRate" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "availability" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."health_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diabetesType" "public"."DiabetesType",
    "diagnosedAt" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "age" INTEGER,
    "goals" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."ResourceType" NOT NULL,
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "tags" TEXT NOT NULL,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "premiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_downloads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "durationId" TEXT NOT NULL,
    "specialtyId" TEXT,
    "category" "public"."SessionCategory" NOT NULL DEFAULT 'CONSULTATION',
    "modality" "public"."SessionModality" NOT NULL DEFAULT 'ONLINE',
    "requiresPrereq" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professional_session_templates" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "sessionTemplateId" TEXT NOT NULL,
    "customPrice" DOUBLE PRECISION,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_session_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_durations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_durations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "sessionTemplateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "meetingUrl" TEXT,
    "recordingUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "professionalAmount" DOUBLE PRECISION,
    "platformAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "responses" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professional_specialties" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "diabetesType" "public"."DiabetesType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "professional_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "public"."NewsletterSource" NOT NULL DEFAULT 'MAINTENANCE_PAGE',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "spamScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "interests" TEXT[],

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_userId_key" ON "public"."professionals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_userId_key" ON "public"."health_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_downloads_userId_resourceId_key" ON "public"."resource_downloads"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_session_templates_professionalId_sessionTempla_key" ON "public"."professional_session_templates"("professionalId", "sessionTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "session_durations_minutes_key" ON "public"."session_durations"("minutes");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sessionId_key" ON "public"."payments"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "public"."payments"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_specialties_professionalId_diabetesType_key" ON "public"."professional_specialties"("professionalId", "diabetesType");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "public"."newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_verifyToken_key" ON "public"."newsletter_subscriptions"("verifyToken");

-- AddForeignKey
ALTER TABLE "public"."professionals" ADD CONSTRAINT "professionals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."health_profiles" ADD CONSTRAINT "health_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_downloads" ADD CONSTRAINT "resource_downloads_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_downloads" ADD CONSTRAINT "resource_downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_templates" ADD CONSTRAINT "session_templates_durationId_fkey" FOREIGN KEY ("durationId") REFERENCES "public"."session_durations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_templates" ADD CONSTRAINT "session_templates_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "public"."session_specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_templates" ADD CONSTRAINT "session_templates_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "public"."session_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_session_templates" ADD CONSTRAINT "professional_session_templates_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "public"."professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_session_templates" ADD CONSTRAINT "professional_session_templates_sessionTemplateId_fkey" FOREIGN KEY ("sessionTemplateId") REFERENCES "public"."session_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "public"."professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_sessionTemplateId_fkey" FOREIGN KEY ("sessionTemplateId") REFERENCES "public"."session_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessments" ADD CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professional_specialties" ADD CONSTRAINT "professional_specialties_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "public"."professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
