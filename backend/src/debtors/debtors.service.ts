import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { appConfig } from '../config';
import { monthRange } from '../common/utils/date';
import { PrismaService } from '../prisma/prisma.service';
import { DebtorsQueryDto } from './dto/debtors-query.dto';
import { DebtorEntity, DebtorListEntity } from './entities/debtor.entity';

interface DebtorRow extends DebtorEntity {
  total: bigint;
  totalDebt: bigint;
}

interface TotalsRow {
  total: bigint;
  totalDebt: bigint | null;
}

@Injectable()
export class DebtorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * A debtor for month M is a student created before the end of M (in the app time zone)
   * whose payments dated within M sum to less than monthlyFee. Overpayment does not carry over.
   * Everything is computed in one SQL statement; totals come from window functions.
   */
  async findDebtors(query: DebtorsQueryDto): Promise<DebtorListEntity> {
    const { start, end } = monthRange(query.month);
    const filter = this.debtorsCte(start, end);

    const rows = await this.prisma.$queryRaw<DebtorRow[]>`
      ${filter}
      SELECT id, name, phone, "group", "monthlyFee", paid, debt,
             COUNT(*) OVER () AS total,
             SUM(debt) OVER () AS "totalDebt"
      FROM debtors
      ORDER BY debt DESC, name ASC, id ASC
      LIMIT ${query.limit} OFFSET ${query.offset}
    `;

    if (rows.length > 0) {
      return {
        month: query.month,
        items: rows.map(toDebtor),
        total: Number(rows[0].total),
        totalDebt: Number(rows[0].totalDebt),
      };
    }

    // Window totals are lost when the page is empty. Only then (offset past the end) is a
    // second statement needed; a plain empty month returns zeros without it.
    if (query.offset === 0) {
      return { month: query.month, items: [], total: 0, totalDebt: 0 };
    }
    const [totals] = await this.prisma.$queryRaw<TotalsRow[]>`
      ${filter}
      SELECT COUNT(*) AS total, SUM(debt) AS "totalDebt" FROM debtors
    `;
    return {
      month: query.month,
      items: [],
      total: Number(totals.total),
      totalDebt: Number(totals.totalDebt ?? 0),
    };
  }

  private debtorsCte(start: string, end: string): Prisma.Sql {
    return Prisma.sql`
      WITH paid AS (
        SELECT student_id, SUM(amount)::int AS paid
        FROM payments
        WHERE paid_at >= ${start}::date AND paid_at < ${end}::date
        GROUP BY student_id
      ),
      debtors AS (
        SELECT s.id, s.name, s.phone, s.group_name AS "group", s.monthly_fee AS "monthlyFee",
               COALESCE(p.paid, 0) AS paid,
               s.monthly_fee - COALESCE(p.paid, 0) AS debt
        FROM students s
        LEFT JOIN paid p ON p.student_id = s.id
        WHERE s.created_at < (${end}::date::timestamp AT TIME ZONE ${appConfig.timeZone})
          AND COALESCE(p.paid, 0) < s.monthly_fee
      )
    `;
  }
}

function toDebtor(row: DebtorRow): DebtorEntity {
  const { id, name, phone, group, monthlyFee, paid, debt } = row;
  return { id, name, phone, group, monthlyFee, paid, debt };
}
