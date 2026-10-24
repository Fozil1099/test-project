import request from 'supertest';
import { App } from 'supertest/types';
import { countQueries, createTestApp, resetDb, TestContext } from './utils';

const valid = { name: 'Алиев Азиз', phone: '+998901234567', group: 'A', monthlyFee: 500000 };

describe('Students (e2e)', () => {
  let ctx: TestContext;
  let http: App;

  beforeAll(async () => {
    ctx = await createTestApp();
    http = ctx.app.getHttpServer();
  });
  beforeEach(() => resetDb(ctx.prisma));
  afterAll(() => ctx.app.close());

  it('creates a student, trimming strings', async () => {
    const res = await request(http)
      .post('/api/students')
      .send({ ...valid, name: '  Алиев Азиз  ' })
      .expect(201);
    expect(res.body).toMatchObject({ id: 1, ...valid });
    expect(typeof res.body.createdAt).toBe('string');
  });

  it.each([
    ['short name', { name: 'A' }],
    ['bad phone', { phone: '901234567' }],
    ['phone too long', { phone: '+9989012345678' }],
    ['empty group', { group: '   ' }],
    ['zero fee', { monthlyFee: 0 }],
    ['fractional fee', { monthlyFee: 100.5 }],
    ['fee as string', { monthlyFee: '500000' }],
    ['unknown field', { extra: true }],
  ])('rejects %s with 400', async (_, patch) => {
    const res = await request(http)
      .post('/api/students')
      .send({ ...valid, ...patch })
      .expect(400);
    expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
  });

  it('gets, updates and deletes a student', async () => {
    const { body: created } = await request(http).post('/api/students').send(valid).expect(201);

    await request(http).get(`/api/students/${created.id}`).expect(200, created);

    const { body: updated } = await request(http)
      .patch(`/api/students/${created.id}`)
      .send({ monthlyFee: 700000 })
      .expect(200);
    expect(updated).toMatchObject({ ...valid, monthlyFee: 700000 });

    await request(http).delete(`/api/students/${created.id}`).expect(204);
    await request(http).get(`/api/students/${created.id}`).expect(404);
  });

  it('returns 404 for a missing student on get, patch and delete', async () => {
    for (const send of [
      () => request(http).get('/api/students/999'),
      () => request(http).patch('/api/students/999').send({ name: 'Новое имя' }),
      () => request(http).delete('/api/students/999'),
    ]) {
      const res = await send().expect(404);
      expect(res.body).toEqual({
        statusCode: 404,
        message: 'Student 999 not found',
        error: 'Not Found',
      });
    }
  });

  it.each(['abc', '0', '-1', '1.5', '99999999999'])('rejects id %p with 400', async (id) => {
    await request(http).get(`/api/students/${id}`).expect(400);
  });

  it('deletes payments together with the student (cascade)', async () => {
    const { body: s } = await request(http).post('/api/students').send(valid).expect(201);
    await request(http)
      .post('/api/payments')
      .send({ studentId: s.id, amount: 100000, paidAt: '2026-01-10' })
      .expect(201);

    await request(http).delete(`/api/students/${s.id}`).expect(204);
    expect(await ctx.prisma.payment.count()).toBe(0);
  });

  describe('list', () => {
    beforeEach(async () => {
      await ctx.prisma.student.createMany({
        data: [
          { name: 'Бобур', phone: '+998901111111', group: 'A', monthlyFee: 1 },
          { name: 'Азиз', phone: '+998902222222', group: 'B', monthlyFee: 1 },
          { name: 'Мадина', phone: '+998903333333', group: 'A', monthlyFee: 1 },
        ],
      });
    });

    it('paginates sorted by name and returns total', async () => {
      const res = await request(http).get('/api/students?limit=2&offset=1').expect(200);
      expect(res.body.total).toBe(3);
      expect(res.body.items.map((s: { name: string }) => s.name)).toEqual(['Бобур', 'Мадина']);
    });

    it('searches by name case-insensitively and by phone', async () => {
      const byName = await request(http).get('/api/students').query({ search: 'мад' });
      expect(byName.body.items.map((s: { name: string }) => s.name)).toEqual(['Мадина']);

      const byPhone = await request(http).get('/api/students').query({ search: '2222' });
      expect(byPhone.body).toMatchObject({ total: 1, items: [{ name: 'Азиз' }] });
    });

    it.each(['%', '_', '\\'])('treats %p in search literally', async (search) => {
      const res = await request(http).get('/api/students').query({ search }).expect(200);
      expect(res.body.total).toBe(0);
    });

    it('filters by group', async () => {
      const res = await request(http).get('/api/students?group=A').expect(200);
      expect(res.body.total).toBe(2);
    });

    it('rejects limit above 100', async () => {
      await request(http).get('/api/students?limit=101').expect(400);
    });
  });

  describe('SQL statements per request', () => {
    it('stays within the norms', async () => {
      const create = await countQueries(ctx, () =>
        request(http).post('/api/students').send(valid).expect(201),
      );
      expect(create.count).toBeLessThanOrEqual(2);

      const list = await countQueries(ctx, () =>
        request(http).get('/api/students').query({ search: 'али', group: 'A' }).expect(200),
      );
      expect(list.count).toBeLessThanOrEqual(2);

      const patch = await countQueries(ctx, () =>
        request(http).patch('/api/students/1').send({ name: 'Новое' }).expect(200),
      );
      expect(patch.count).toBeLessThanOrEqual(2);

      const del = await countQueries(ctx, () =>
        request(http).delete('/api/students/1').expect(204),
      );
      expect(del.count).toBeLessThanOrEqual(2);
    });
  });
});
