/**
 * Load-test data: 10 000 students and ~300 000 payments over the last 24 months.
 * WIPES students and payments first. Generated inside Postgres with generate_series,
 * which is much faster than sending rows from Node.
 *
 *   npm run seed:large            # 10 000 students
 *   STUDENTS=50000 npm run seed:large
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const STUDENTS = Number(process.env.STUDENTS ?? 10_000);
const MONTHS = 24;

async function main(): Promise<void> {
  const started = Date.now();
  await prisma.$executeRawUnsafe('TRUNCATE payments, students RESTART IDENTITY CASCADE');

  await prisma.$executeRaw`
    INSERT INTO students (name, phone, group_name, monthly_fee, created_at)
    SELECT
      (ARRAY['Алиев','Каримов','Рахимов','Юсупов','Назаров','Саидов','Эргашев','Холматов','Исмоилов','Ахмедов'])[1 + n % 10]
        || ' ' ||
      (ARRAY['Азиз','Бобур','Тимур','Жасур','Сардор','Отабек','Улугбек','Санжар','Шерзод','Ильхом','Мадина','Нигора','Камола','Лола','Зарина'])[1 + (n / 10) % 15]
        || ' ' || n,
      '+99890' || lpad(n::text, 7, '0'),
      'Группа ' || (1 + n % 40),
      (3 + n % 7) * 100000,
      now() - make_interval(months => ${MONTHS + 1}::int)
    FROM generate_series(1, ${STUDENTS}::int) AS n
  `;

  // Per student and month: first payment with 90% chance (70% of them full, rest half),
  // second payment (half fee) with 35% chance. About 1.25 payments per month, 30 per student.
  // random() is computed in the select list behind OFFSET 0: in WHERE the planner pushes it
  // down to the small generate_series and evaluates it once for all students.
  await prisma.$executeRaw`
    INSERT INTO payments (student_id, amount, paid_at)
    SELECT id,
           CASE WHEN k = 1 AND r_full < 0.7 THEN monthly_fee ELSE monthly_fee / 2 END,
           (date_trunc('month', now()) - make_interval(months => m))::date + r_day
    FROM (
      SELECT s.id, s.monthly_fee, m, k,
             random() AS r_keep, random() AS r_full, (random() * 27)::int AS r_day
      FROM students s
      CROSS JOIN generate_series(0, ${MONTHS - 1}::int) AS m
      CROSS JOIN generate_series(1, 2) AS k
      OFFSET 0
    ) AS candidates
    WHERE (k = 1 AND r_keep < 0.9) OR (k = 2 AND r_keep < 0.35)
  `;
  // Payments generated for the current month must not land in the future.
  await prisma.$executeRaw`UPDATE payments SET paid_at = CURRENT_DATE WHERE paid_at > CURRENT_DATE`;
  await prisma.$executeRawUnsafe('ANALYZE students, payments');

  const [students, payments] = await Promise.all([prisma.student.count(), prisma.payment.count()]);
  console.log(`Seeded ${students} students, ${payments} payments in ${Date.now() - started} ms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
