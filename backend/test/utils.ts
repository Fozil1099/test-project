import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  /** SQL statements executed since the last reset(), without transaction control. */
  queries: string[];
}

export async function createTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  setupApp(app);
  await app.init();

  const prisma = app.get(PrismaService);
  const queries: string[] = [];
  prisma.$on('query', (e) => {
    if (!/^(BEGIN|COMMIT|ROLLBACK|DEALLOCATE)/i.test(e.query.trim())) queries.push(e.query);
  });
  return { app, prisma, queries };
}

export async function resetDb(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe('TRUNCATE payments, students RESTART IDENTITY CASCADE');
}

/** Runs fn and returns how many SQL statements it caused. */
export async function countQueries<T>(
  ctx: TestContext,
  fn: () => Promise<T>,
): Promise<{ result: T; count: number }> {
  ctx.queries.length = 0;
  const result = await fn();
  return { result, count: ctx.queries.length };
}
