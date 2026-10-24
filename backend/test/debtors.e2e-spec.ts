import request from 'supertest';
import { App } from 'supertest/types';
import { countQueries, createTestApp, resetDb, TestContext } from './utils';

describe('Debtors (e2e)', () => {
  let ctx: TestContext;
  let http: App;

  const student = (name: string, monthlyFee: number, createdAt = '2026-01-01T00:00:00+05:00') =>
    ctx.prisma.student.create({
      data: {
        name,
        phone: '+998901234567',
        group: 'A',
        monthlyFee,
        createdAt: new Date(createdAt),
      },
    });
  const pay = (studentId: number, amount: number, paidAt: string) =>
    ctx.prisma.payment.create({
      data: { studentId, amount, paidAt: new Date(`${paidAt}T00:00:00Z`) },
    });
  const debtors = (month: string, extra = '') =>
    request(http).get(`/api/debtors?month=${month}${extra}`).expect(200);

  beforeAll(async () => {
    ctx = await createTestApp();
    http = ctx.app.getHttpServer();
  });
  beforeEach(() => resetDb(ctx.prisma));
  afterAll(() => ctx.app.close());

  it.each(['', '2026-13', '2026-1', '2026-10-01', 'oct'])(
    'rejects month %p with 400',
    async (m) => {
      await request(http).get(`/api/debtors?month=${m}`).expect(400);
    },
  );

  it('requires month', async () => {
    await request(http).get('/api/debtors').expect(400);
  });

  it('returns zeros for a month without students', async () => {
    const res = await debtors('2026-10');
    expect(res.body).toEqual({ month: '2026-10', items: [], total: 0, totalDebt: 0 });
  });

  it('treats a student without payments as owing the full fee', async () => {
    const s = await student('Азиз', 500000);
    const res = await debtors('2026-10');
    expect(res.body.items).toEqual([
      {
        id: s.id,
        name: 'Азиз',
        phone: '+998901234567',
        group: 'A',
        monthlyFee: 500000,
        paid: 0,
        debt: 500000,
      },
    ]);
  });

  it('sums several partial payments within the month', async () => {
    const s = await student('Азиз', 500000);
    await pay(s.id, 100000, '2026-10-01');
    await pay(s.id, 150000, '2026-10-31');
    const res = await debtors('2026-10');
    expect(res.body.items[0]).toMatchObject({ paid: 250000, debt: 250000 });
  });

  it('ignores payments from neighbouring months (boundaries are exact)', async () => {
    const s = await student('Азиз', 500000);
    await pay(s.id, 500000, '2026-09-30');
    await pay(s.id, 500000, '2026-11-01');
    const res = await debtors('2026-10');
    expect(res.body.items[0]).toMatchObject({ paid: 0, debt: 500000 });
  });

  it('excludes students who paid exactly or overpaid, without carrying over', async () => {
    const exact = await student('Ровно', 500000);
    const over = await student('Переплата', 500000);
    await pay(exact.id, 500000, '2026-10-10');
    await pay(over.id, 900000, '2026-10-10');

    expect((await debtors('2026-10')).body.total).toBe(0);
    // Overpayment in October does not cover November.
    const nov = await debtors('2026-11');
    expect(nov.body.items.map((d: { name: string }) => d.name).sort()).toEqual([
      'Переплата',
      'Ровно',
    ]);
  });

  it('skips students created after the month, counting in the app time zone', async () => {
    await student('Ноябрь', 500000, '2026-11-01T00:30:00+05:00'); // 2026-10-31 19:30 UTC
    await student('Октябрь', 500000, '2026-10-31T23:59:00+05:00');
    const res = await debtors('2026-10');
    expect(res.body.items.map((d: { name: string }) => d.name)).toEqual(['Октябрь']);
    expect((await debtors('2026-11')).body.total).toBe(2);
  });

  it('sorts by debt desc then name, paginates and keeps totals for all pages', async () => {
    const a = await student('Бобур', 300000);
    await student('Азиз', 300000);
    const c = await student('Вали', 1000000);
    await pay(a.id, 100000, '2026-10-05'); // debt 200000
    await pay(c.id, 100000, '2026-10-05'); // debt 900000

    const all = await debtors('2026-10');
    expect(all.body.items.map((d: { name: string }) => d.name)).toEqual(['Вали', 'Азиз', 'Бобур']);
    expect(all.body).toMatchObject({ total: 3, totalDebt: 1400000 });

    const page = await debtors('2026-10', '&limit=1&offset=1');
    expect(page.body).toMatchObject({ total: 3, totalDebt: 1400000, items: [{ name: 'Азиз' }] });

    const past = await debtors('2026-10', '&offset=10');
    expect(past.body).toEqual({ month: '2026-10', items: [], total: 3, totalDebt: 1400000 });
  });

  it('uses a single SQL statement per request', async () => {
    const s = await student('Азиз', 500000);
    await pay(s.id, 100000, '2026-10-05');
    const { count } = await countQueries(ctx, () => debtors('2026-10'));
    expect(count).toBe(1);
  });
});
