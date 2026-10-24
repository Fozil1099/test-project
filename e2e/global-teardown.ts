import { request } from '@playwright/test';
import { API } from './tests/helpers';

/** Removes students the tests created (group E2E), even after a failed run. */
export default async function globalTeardown() {
  const ctx = await request.newContext();
  for (;;) {
    const { items } = await (await ctx.get(`${API}/students?group=E2E&limit=100`)).json();
    if (!items.length) break;
    for (const s of items) await ctx.delete(`${API}/students/${s.id}`);
  }
  await ctx.dispose();
}
