import { expect, test } from '@playwright/test';
import { API, collectConsoleErrors, expectNoHorizontalScroll, shot, trackApi } from './helpers';

test.describe('Ученики', () => {
  test('создать, изменить, удалить; ошибки валидации видны в форме', async ({ page, request }, info) => {
    const errors = collectConsoleErrors(page);
    const name = `E2E Ученик ${Math.random().toString(36).slice(2, 6)}`;
    await page.goto('/students');
    await expect(page.getByTestId('students-list')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await shot(page, info, '07-students');

    await page.getByTestId('create-student-open').click();
    const sheet = page.getByTestId('create-student-sheet');
    await sheet.getByTestId('student-phone').fill('123');
    await sheet.getByTestId('student-submit').click();
    await expect(sheet.locator('[aria-invalid="true"]')).toHaveCount(4);
    await expect(sheet.getByText('Формат: +998 и 9 цифр')).toBeVisible();
    await shot(page, info, '08-student-validation');

    await sheet.getByTestId('student-name').fill(name);
    await sheet.getByTestId('student-phone').fill('+998 90 123 45 67');
    await sheet.getByTestId('student-group').fill('E2E');
    await sheet.getByTestId('student-fee').fill('450000');
    await sheet.getByTestId('student-submit').click();
    await expect(page.getByTestId('toast-success').first()).toBeVisible();
    await expect(sheet).toBeHidden();

    const found = await (await request.get(`${API}/students?search=${encodeURIComponent(name)}`)).json();
    expect(found.total).toBe(1);
    const created = found.items[0];
    expect(created).toMatchObject({ name, phone: '+998901234567', group: 'E2E', monthlyFee: 450000 });

    // Search on the page finds it
    await page.getByTestId('student-search').fill(name);
    const card = page.getByTestId('student-card').filter({ hasText: name });
    await expect(card).toHaveCount(1);
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/students/${created.id}$`));
    await expect(page.getByTestId('student-info')).toContainText('E2E');
    await expect(page.getByTestId('payments-empty')).toBeVisible();
    await shot(page, info, '09-student-details');

    // Edit
    await page.getByTestId('edit-student-open').click();
    const form = page.getByTestId('student-form');
    await form.getByTestId('student-fee').fill('550000');
    await form.getByTestId('student-submit').click();
    await expect(page.getByTestId('toast-success').filter({ hasText: 'Изменения сохранены' })).toBeVisible();
    await expect(page.getByTestId('student-info')).toContainText(/550\s000/);
    const updated = await (await request.get(`${API}/students/${created.id}`)).json();
    expect(updated.monthlyFee).toBe(550000);

    // Delete
    await page.getByTestId('delete-student-open').click();
    await shot(page, info, '10-student-delete');
    await page.getByTestId('delete-student-confirm').click();
    await expect(page).toHaveURL(/\/students$/);
    expect((await request.get(`${API}/students/${created.id}`)).status()).toBe(404);

    expect(errors).toEqual([]);
  });

  test('список учеников дебаунсит поиск', async ({ page }) => {
    await page.goto('/students');
    await expect(page.getByTestId('students-list')).toBeVisible();
    const api = trackApi(page);
    await page.getByTestId('student-search').pressSequentially('Алиев', { delay: 50 });
    // 300 ms debounce + margin: we check that no extra requests arrive after typing stops.
    await page.waitForTimeout(600);
    expect(api.paths().filter((p) => p.includes('search='))).toHaveLength(1);
  });

  test('несуществующий ученик: страница «не найден»', async ({ page }, info) => {
    await page.goto('/students/99999999');
    await expect(page.getByTestId('student-not-found')).toBeVisible();
    await shot(page, info, '11-student-not-found');
  });
});

test('переключение вкладок туда-обратно не порождает лишних запросов', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('debtors-list')).toBeVisible();
  await page.getByTestId('nav-students').click();
  await expect(page.getByTestId('students-list')).toBeVisible();

  const api = trackApi(page);
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('nav-debtors').click();
    await expect(page.getByTestId('debtors-list')).toBeVisible();
    await page.getByTestId('nav-students').click();
    await expect(page.getByTestId('students-list')).toBeVisible();
  }
  expect(api.paths()).toEqual([]);
  expect(errors).toEqual([]);
});

test('нет горизонтального скролла на 360 px', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'only for mobile');
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/students']) {
    await page.goto(path);
    await expect(page.locator('main ul').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
  await page.goto('/');
  await page.getByTestId('add-payment-open').click();
  await expectNoHorizontalScroll(page);
  await shot(page, info, '12-360px-payment');
});

test('карточка ученика: ученик и оплаты грузятся параллельно, без водопада', async ({ page, request }) => {
  const { items } = await (await request.get(`${API}/students?limit=1`)).json();
  const id = items[0].id;
  const started: Record<string, number> = {};
  const finished: Record<string, number> = {};
  page.on('request', (r) => r.url().includes('/api/') && (started[new URL(r.url()).pathname] = Date.now()));
  page.on('requestfinished', (r) => r.url().includes('/api/') && (finished[new URL(r.url()).pathname] = Date.now()));
  await page.goto(`/students/${id}`);
  await expect(page.getByTestId('student-info')).toBeVisible();
  await page.waitForLoadState('networkidle');
  const student = `/api/students/${id}`;
  const payments = `/api/students/${id}/payments`;
  expect(started[payments], 'payments request starts before the student response arrives').toBeLessThanOrEqual(finished[student]);
});
