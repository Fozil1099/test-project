import request from 'supertest';
import { App } from 'supertest/types';
import { todayIn } from '../src/common/utils/date';
import { countQueries, createTestApp, resetDb, TestContext } from './utils';

describe('Payments (e2e)', () => {
  let ctx: TestContext;
  let http: App;
  let studentId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    http = ctx.app.getHttpServer();
  });
  beforeEach(async () => {
    await resetDb(ctx.prisma);
    ({ id: studentId } = await ctx.prisma.student.create({
      data: { name: 'Алиев Азиз', phone: '+998901234567', group: 'A', monthlyFee: 500000 },
    }));
  });
  afterAll(() => ctx.app.close());

  it('creates a payment and returns paidAt as YYYY-MM-DD', async () => {
    const res = await request(http)
      .post('/api/payments')
      .send({ studentId, amount: 200000, paidAt: '2026-10-05' })
      .expect(201);
    expect(res.body).toMatchObject({ id: 1, studentId, amount: 200000, paidAt: '2026-10-05' });
  });

  it('accepts today in the app time zone', async () => {
    const today = todayIn('Asia/Tashkent');
    await request(http)
      .post('/api/payments')
      .send({ studentId, amount: 1, paidAt: today })
      .expect(201);
  });

  it.each([
    ['zero amount', { amount: 0 }],
    ['negative amount', { amount: -5 }],
    ['fractional amount', { amount: 10.5 }],
    ['future date', { paidAt: '2999-01-01' }],
    ['impossible date', { paidAt: '2026-02-30' }],
    ['datetime instead of date', { paidAt: '2026-10-05T10:00:00Z' }],
    ['missing studentId', { studentId: undefined }],
  ])('rejects %s with 400', async (_, patch) => {
    await request(http)
      .post('/api/payments')
      .send({ studentId, amount: 1000, paidAt: '2026-10-05', ...patch })
      .expect(400);
  });

  it('returns 404 for an unknown student', async () => {
    const res = await request(http)
      .post('/api/payments')
      .send({ studentId: 999, amount: 1000, paidAt: '2026-10-05' })
      .expect(404);
    expect(res.body.message).toBe('Student 999 not found');
  });

  it('lists payments of a student, newest first, with pagination', async () => {
    await ctx.prisma.payment.createMany({
      data: ['2026-08-01', '2026-10-01', '2026-09-01'].map((d) => ({
        studentId,
        amount: 1000,
        paidAt: new Date(`${d}T00:00:00Z`),
      })),
    });
    const res = await request(http).get(`/api/students/${studentId}/payments?limit=2`).expect(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items.map((p: { paidAt: string }) => p.paidAt)).toEqual([
      '2026-10-01',
      '2026-09-01',
    ]);
  });

  it('returns an empty list for a student without payments, 404 for a missing one', async () => {
    await request(http)
      .get(`/api/students/${studentId}/payments`)
      .expect(200, { items: [], total: 0 });
    await request(http).get('/api/students/999/payments').expect(404);
  });

  it('stays within the SQL statement norms', async () => {
    const create = await countQueries(ctx, () =>
      request(http)
        .post('/api/payments')
        .send({ studentId, amount: 1000, paidAt: '2026-10-05' })
        .expect(201),
    );
    expect(create.count).toBeLessThanOrEqual(2);

    const list = await countQueries(ctx, () =>
      request(http).get(`/api/students/${studentId}/payments`).expect(200),
    );
    expect(list.count).toBeLessThanOrEqual(2);
  });
});
