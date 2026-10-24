import { delay, http, HttpResponse } from 'msw';
import { MONTH_RE } from '@/shared/lib';
import { createPayment, createStudent, debtorsFor, payments, removeStudent, students } from './db';

const api = (path: string) => `*/api${path}`;

const page = (url: URL) => ({
  limit: Math.min(100, Number(url.searchParams.get('limit') ?? 50)),
  offset: Number(url.searchParams.get('offset') ?? 0),
});

const notFound = (what: string) =>
  HttpResponse.json(
    { statusCode: 404, message: `${what} not found`, error: 'Not Found' },
    { status: 404 },
  );

const badRequest = (message: string[]) =>
  HttpResponse.json({ statusCode: 400, message, error: 'Bad Request' }, { status: 400 });

export const handlers = [
  http.all(api('/*'), () => delay(250)),

  http.get(api('/students'), ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const group = url.searchParams.get('group');
    const { limit, offset } = page(url);
    const filtered = students
      .filter(
        (s) =>
          (!search || s.name.toLowerCase().includes(search) || s.phone.includes(search)) &&
          (!group || s.group === group),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return HttpResponse.json({
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
    });
  }),

  http.get(api('/students/:id'), ({ params }) => {
    const student = students.find((s) => s.id === Number(params.id));
    return student ? HttpResponse.json(student) : notFound('Student');
  }),

  http.post(api('/students'), async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof createStudent>[0];
    return HttpResponse.json(createStudent(body), { status: 201 });
  }),

  http.patch(api('/students/:id'), async ({ params, request }) => {
    const student = students.find((s) => s.id === Number(params.id));
    if (!student) return notFound('Student');
    Object.assign(student, await request.json());
    return HttpResponse.json(student);
  }),

  http.delete(api('/students/:id'), ({ params }) => {
    if (!students.some((s) => s.id === Number(params.id))) return notFound('Student');
    removeStudent(Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api('/students/:id/payments'), ({ params, request }) => {
    const { limit, offset } = page(new URL(request.url));
    const list = payments
      .filter((p) => p.studentId === Number(params.id))
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt) || b.id - a.id);
    return HttpResponse.json({ items: list.slice(offset, offset + limit), total: list.length });
  }),

  http.post(api('/payments'), async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof createPayment>[0];
    if (!students.some((s) => s.id === body.studentId)) return notFound('Student');
    return HttpResponse.json(createPayment(body), { status: 201 });
  }),

  http.get(api('/debtors'), ({ request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month') ?? '';
    if (!MONTH_RE.test(month)) return badRequest(['month must be in YYYY-MM format']);
    const { limit, offset } = page(url);
    const all = debtorsFor(month);
    return HttpResponse.json({
      month,
      items: all.slice(offset, offset + limit),
      total: all.length,
      totalDebt: all.reduce((sum, d) => sum + d.debt, 0),
    });
  }),
];
