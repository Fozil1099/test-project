// In-memory fake backend for `npm run dev:mock`. Follows the API contract in plan/tasks/00-common.md.
import type { Debtor } from '@/entities/debtor';
import type { Payment } from '@/entities/payment';
import type { Student } from '@/entities/student';
import { currentMonth, shiftMonth, today } from '@/shared/lib';

let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)];

const firstNames = [
  'Азиз',
  'Дилноза',
  'Шахзод',
  'Малика',
  'Жасур',
  'Нилуфар',
  'Бобур',
  'Севара',
  'Тимур',
  'Камила',
  'Ислом',
  'Мадина',
  'Отабек',
  'Зарина',
  'Санжар',
];
const lastNames = [
  'Каримов',
  'Юсупова',
  'Рахимов',
  'Алиева',
  'Турсунов',
  'Абдуллаева',
  'Исмоилов',
  'Назарова',
  'Хасанов',
  'Мирзаева',
];
const groups = [
  'English A1',
  'English B1',
  'IELTS 6.5',
  'Математика 9',
  'Python Start',
  'Корейский',
];
const fees = [400_000, 500_000, 600_000, 750_000, 900_000];

export const students: Student[] = [];
export const payments: Payment[] = [];
let studentSeq = 1;
let paymentSeq = 1;

const now = currentMonth();
for (let i = 0; i < 137; i++) {
  const monthsAgo = Math.floor(rand() * 8);
  const joined = shiftMonth(now, -monthsAgo);
  const student: Student = {
    id: studentSeq++,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    phone: `+99890${String(1_000_000 + Math.floor(rand() * 8_999_999)).slice(0, 7)}`,
    group: pick(groups),
    monthlyFee: pick(fees),
    createdAt: `${joined}-0${1 + Math.floor(rand() * 9)}T09:00:00.000Z`,
  };
  students.push(student);

  for (let m = monthsAgo; m >= 0; m--) {
    const month = shiftMonth(now, -m);
    const r = rand();
    // ~60% pay in full, ~25% partially, ~15% skip the month.
    const parts =
      r < 0.6
        ? [student.monthlyFee]
        : r < 0.85
          ? [Math.round((student.monthlyFee * (0.2 + rand() * 0.6)) / 10_000) * 10_000]
          : [];
    for (const amount of parts) {
      const day = Math.min(28, 1 + Math.floor(rand() * 28));
      const paidAt = `${month}-${String(day).padStart(2, '0')}`;
      if (paidAt > today()) continue;
      payments.push({
        id: paymentSeq++,
        studentId: student.id,
        amount,
        paidAt,
        createdAt: `${paidAt}T10:00:00.000Z`,
      });
    }
  }
}

export function createStudent(input: Omit<Student, 'id' | 'createdAt'>): Student {
  const student = { ...input, id: studentSeq++, createdAt: new Date().toISOString() };
  students.push(student);
  return student;
}

export function createPayment(input: Omit<Payment, 'id' | 'createdAt'>): Payment {
  const payment = { ...input, id: paymentSeq++, createdAt: new Date().toISOString() };
  payments.push(payment);
  return payment;
}

export function removeStudent(id: number) {
  students.splice(
    students.findIndex((s) => s.id === id),
    1,
  );
  for (let i = payments.length - 1; i >= 0; i--)
    if (payments[i].studentId === id) payments.splice(i, 1);
}

export function debtorsFor(month: string): Debtor[] {
  const nextMonth = shiftMonth(month, 1);
  const paidBy = new Map<number, number>();
  for (const p of payments) {
    if (p.paidAt >= `${month}-01` && p.paidAt < `${nextMonth}-01`) {
      paidBy.set(p.studentId, (paidBy.get(p.studentId) ?? 0) + p.amount);
    }
  }
  return students
    .filter((s) => s.createdAt.slice(0, 7) <= month)
    .map((s) => {
      const paid = paidBy.get(s.id) ?? 0;
      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        group: s.group,
        monthlyFee: s.monthlyFee,
        paid,
        debt: s.monthlyFee - paid,
      };
    })
    .filter((d) => d.debt > 0)
    .sort((a, b) => b.debt - a.debt || a.name.localeCompare(b.name, 'ru'));
}
