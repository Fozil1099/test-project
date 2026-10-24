import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { toDateString } from '../common/utils/date';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentEntity, PaymentListEntity } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto): Promise<PaymentEntity> {
    try {
      const payment = await this.prisma.payment.create({
        data: {
          studentId: dto.studentId,
          amount: dto.amount,
          paidAt: new Date(`${dto.paidAt}T00:00:00Z`),
        },
      });
      return toEntity(payment);
    } catch (e) {
      // One INSERT instead of "check student, then insert": the FK tells us the student is gone.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new NotFoundException(`Student ${dto.studentId} not found`);
      }
      throw e;
    }
  }

  async findByStudent(studentId: number, query: PaginationQueryDto): Promise<PaymentListEntity> {
    const where = { studentId };
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.payment.count({ where }),
    ]);
    // Only an empty result needs the extra lookup to tell "no payments" from "no student".
    if (total === 0) {
      const exists = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException(`Student ${studentId} not found`);
    }
    return { items: items.map(toEntity), total };
  }
}

function toEntity(payment: Payment): PaymentEntity {
  return { ...payment, paidAt: toDateString(payment.paidAt) };
}
