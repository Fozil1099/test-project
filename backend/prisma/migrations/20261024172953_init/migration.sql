-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(13) NOT NULL,
    "group_name" VARCHAR(50) NOT NULL,
    "monthly_fee" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid_at" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_name_id_idx" ON "students"("name", "id");

-- CreateIndex
CREATE INDEX "students_group_name_idx" ON "students"("group_name");

-- CreateIndex
CREATE INDEX "students_name_trgm_idx" ON "students" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "students_phone_trgm_idx" ON "students" USING GIN ("phone" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "payments_student_id_paid_at_idx" ON "payments"("student_id", "paid_at");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Integrity checks (not expressible in Prisma schema)
ALTER TABLE "students" ADD CONSTRAINT "students_monthly_fee_positive" CHECK ("monthly_fee" > 0);
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_positive" CHECK ("amount" > 0);
