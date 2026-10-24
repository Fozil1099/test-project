import { expect, type APIRequestContext, type Page, type Request, type TestInfo } from '@playwright/test';

export const API = process.env.E2E_API_URL ?? 'http://localhost:8080/api';

export interface Student {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
}

export const currentMonth = () => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const today = () => `${currentMonth()}-${String(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' })).getDate()).padStart(2, '0')}`;

/** Digits only: Intl uses non-breaking spaces as thousand separators. */
export const digits = (s: string | null) => Number((s ?? '').replace(/\D/g, ''));

const randomPhone = () => `+99890${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;

/**
 * Creates a student with a huge fee, so it is first in the debtors list (sorted by debt desc).
 */
export async function createStudent(request: APIRequestContext, overrides: Partial<Student> = {}) {
  const res = await request.post(`${API}/students`, {
    data: {
      name: `E2E ${Math.random().toString(36).slice(2, 8)}`,
      phone: randomPhone(),
      group: 'E2E',
      monthlyFee: 99_000_000,
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as Student;
}

export async function deleteStudent(request: APIRequestContext, id: number) {
  await request.delete(`${API}/students/${id}`);
}

/** Records every API request the page makes. */
export function trackApi(page: Page) {
  const requests: Request[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/')) requests.push(r);
  });
  return {
    requests,
    paths: () => requests.map((r) => `${r.method()} ${new URL(r.url()).pathname}${new URL(r.url()).search}`),
    clear: () => requests.splice(0),
  };
}

/** Fails the test on console errors and uncaught exceptions. */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'horizontal overflow, px').toBeLessThanOrEqual(0);
}

export const shot = (page: Page, info: TestInfo, name: string) =>
  page.screenshot({ path: `../qa/screenshots/${info.project.name}-${name}.png`, fullPage: false });
