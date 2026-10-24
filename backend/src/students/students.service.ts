import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateStudentDto): Promise<Student> {
    return this.prisma.student.create({ data: dto });
  }

  async findAll(query: ListStudentsQueryDto): Promise<{ items: Student[]; total: number }> {
    const where: Prisma.StudentWhereInput = {};
    if (query.group) where.group = query.group;
    if (query.search) {
      const search = escapeLike(query.search);
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    // Two independent statements run in parallel on the pool. A transaction would not
    // give a consistent snapshot here anyway under READ COMMITTED.
    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.student.count({ where }),
    ]);
    return { items, total };
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  update(id: number, dto: UpdateStudentDto): Promise<Student> {
    return this.prisma.student
      .update({ where: { id }, data: dto })
      .catch((e: unknown) => rethrowNotFound(e, id));
  }

  async remove(id: number): Promise<void> {
    // Payments are removed by ON DELETE CASCADE.
    await this.prisma.student
      .delete({ where: { id }, select: { id: true } })
      .catch((e: unknown) => rethrowNotFound(e, id));
  }
}

/** Prisma passes `contains` to LIKE as is, so % and _ would act as wildcards. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/** A single UPDATE/DELETE raises P2025 for a missing row, so no prior SELECT is needed. */
function rethrowNotFound(e: unknown, id: number): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    throw new NotFoundException(`Student ${id} not found`);
  }
  throw e;
}
