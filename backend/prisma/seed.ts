/**
 * Demo data for the UI: 20 students in 3 groups, payments for the last three months,
 * with a mix of paid, partially paid and unpaid students in the current month.
 * Idempotent: does nothing if students already exist.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GROUPS = [
  { group: 'Frontend-1', monthlyFee: 600_000 },
  { group: 'Backend-1', monthlyFee: 700_000 },
  { group: 'English-B1', monthlyFee: 400_000 },
];

const NAMES = [
  'Алиев Азиз',
  'Каримова Мадина',
  'Рахимов Бобур',
  'Юсупова Нигора',
  'Ташкентов Тимур',
  'Абдуллаева Шахноза',
  'Исмоилов Жасур',
  'Хасанова Дильноза',
  'Назаров Сардор',
  'Умарова Камола',
  'Саидов Отабек',
  'Мирзаева Феруза',
  'Эргашев Улугбек',
  'Тошматова Гулнора',
  'Холматов Санжар',
  'Кодирова Лола',
  'Бекмуродов Шерзод',
  'Ахмедова Зарина',
  'Нурматов Ильхом',
  'Собирова Севара',
];

/** Payment pattern for the current month: 1 = full, 0.5 = half, 0 = nothing. */
const CURRENT_MONTH_SHARE = [1, 0.5, 0, 1, 1, 0, 0.5, 1, 1, 0, 1, 0.25, 1, 1, 0, 1, 0.5, 1, 1, 0];

function monthStart(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
}

async function main(): Promise<void> {
  if ((await prisma.student.count()) > 0) {
    console.log('Students already exist, demo seed skipped');
    return;
  }

  const createdAt = monthStart(-3);
  const today = new Date();
  const students = await prisma.student.createManyAndReturn({
    data: NAMES.map((name, i) => {
      const { group, monthlyFee } = GROUPS[i % GROUPS.length];
      return {
        name,
        phone: `+99890${String(1_000_000 + i * 7_919).padStart(7, '0')}`,
        group,
        monthlyFee,
        createdAt,
      };
    }),
    select: { id: true, monthlyFee: true },
  });

  const payments = students.flatMap((s, i) => {
    const previous = [-2, -1].map((offset) => ({
      studentId: s.id,
      amount: s.monthlyFee,
      paidAt: new Date(monthStart(offset).getTime() + (i % 20) * 86_400_000),
    }));
    const share = CURRENT_MONTH_SHARE[i];
    if (share === 0) return previous;
    const day = Math.min(i % 10, today.getUTCDate() - 1);
    return [
      ...previous,
      {
        studentId: s.id,
        amount: Math.round(s.monthlyFee * share),
        paidAt: new Date(monthStart(0).getTime() + day * 86_400_000),
      },
    ];
  });
  await prisma.payment.createMany({ data: payments });

  console.log(`Seeded ${students.length} students and ${payments.length} payments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
