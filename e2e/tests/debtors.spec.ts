import { expect, test } from '@playwright/test';
import { API, collectConsoleErrors, createStudent, currentMonth, deleteStudent, digits, expectNoHorizontalScroll, shot, trackApi } from './helpers';

test.describe('Должники', () => {
  test('открывается текущий месяц, суммы совпадают с API, смена месяца и «Показать ещё»', async ({ page, request }, info) => {
    const errors = collectConsoleErrors(page);
    const api = trackApi(page);
    const month = currentMonth();
    const expected = await (await request.get(`${API}/debtors?month=${month}`)).json();

    await page.goto('/');
    await expect(page.getByTestId('debtors-list')).toBeVisible();
    expect(api.paths()).toContain(`GET /api/debtors?month=${month}&limit=50&offset=0`);

    expect(digits(await page.getByTestId('total-debt').textContent())).toBe(expected.totalDebt);
    expect(digits(await page.getByTestId('debtors-total').textContent())).toBe(expected.total);
    const firstDebts = await page.getByTestId('debtor-debt').allTextContents();
    expect(firstDebts.map(digits)).toEqual(expected.items.map((d: { debt: number }) => d.debt));
    await expectNoHorizontalScroll(page);
    await shot(page, info, '01-debtors');

    if (expected.total > expected.items.length) {
      await page.getByTestId('load-more').click();
      await expect(page.getByTestId('debtor-card')).toHaveCount(Math.min(100, expected.total));
      expect(api.paths()).toContain(`GET /api/debtors?month=${month}&limit=50&offset=50`);
    }

    // Next month is not allowed: the current month is the latest.
    await expect(page.getByTestId('month-next')).toBeDisabled();
    await page.getByTestId('month-prev').click();
    const [y, m] = month.split('-').map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    await expect(page).toHaveURL(new RegExp(`month=${prev}`));
    const prevExpected = await (await request.get(`${API}/debtors?month=${prev}`)).json();
    await expect(page.getByTestId('debtors-total')).toHaveText(String(prevExpected.total));
    expect(digits(await page.getByTestId('total-debt').textContent())).toBe(prevExpected.totalDebt);
    await shot(page, info, '02-debtors-prev-month');

    // Back to the cached month: no new request (staleTime).
    api.clear();
    await page.getByTestId('month-next').click();
    await expect(page.getByTestId('debtors-total')).toHaveText(String(expected.total));
    expect(api.paths().filter((p) => p.includes('/debtors'))).toEqual([]);

    expect(errors).toEqual([]);
  });

  test('оплата из карточки: частичная уменьшает долг, полная убирает из списка', async ({ page, request }, info) => {
    const errors = collectConsoleErrors(page);
    const student = await createStudent(request);
    try {
      await page.goto('/');
      const card = page.getByTestId('debtor-card').filter({ hasText: student.name });
      await expect(card).toBeVisible();
      expect(digits(await card.getByTestId('debtor-debt').textContent())).toBe(student.monthlyFee);

      // Partial payment
      await card.getByTestId('debtor-pay').click();
      const sheet = page.getByTestId('payment-sheet');
      await expect(sheet.getByTestId('picked-student')).toContainText(student.name);
      expect(digits(await sheet.getByTestId('payment-amount').inputValue())).toBe(student.monthlyFee);
      await sheet.getByTestId('payment-amount').fill('40000000');
      await shot(page, info, '03-payment-sheet');
      await sheet.getByTestId('payment-submit').click();
      await expect(page.getByTestId('toast-success').first()).toBeVisible();
      await expect(sheet).toBeHidden();
      await expect(card.getByTestId('debtor-debt')).toHaveText(/59\s000\s000/);

      // Full payment of the rest
      await card.getByTestId('debtor-pay').click();
      expect(digits(await sheet.getByTestId('payment-amount').inputValue())).toBe(59_000_000);
      await sheet.getByTestId('payment-submit').click();
      await expect(card).toHaveCount(0);
      await shot(page, info, '04-debtors-after-payment');
    } finally {
      await deleteStudent(request, student.id);
    }
    expect(errors).toEqual([]);
  });

  test('оплата через поиск ученика, поиск дебаунсится', async ({ page, request }, info) => {
    const errors = collectConsoleErrors(page);
    const student = await createStudent(request, { name: `Поиск${Math.random().toString(36).slice(2, 6)}` });
    try {
      await page.goto('/');
      await expect(page.getByTestId('debtors-list')).toBeVisible();
      const api = trackApi(page);
      await page.getByTestId('add-payment-open').click();
      const sheet = page.getByTestId('payment-sheet');
      // Type letter by letter faster than the debounce.
      await sheet.getByTestId('payment-student-search').pressSequentially(student.name, { delay: 50 });
      await expect(sheet.getByTestId('payment-student-options')).toContainText(student.name);
      const searches = api.paths().filter((p) => p.startsWith('GET /api/students?'));
      expect(searches, 'one search request per input, not per letter').toHaveLength(1);
      expect(searches[0]).toContain('limit=');
      await shot(page, info, '05-payment-search');

      await sheet.getByRole('option').filter({ hasText: student.name }).click();
      await sheet.getByTestId('payment-amount').fill('1000');
      await sheet.getByTestId('payment-submit').click();
      await expect(page.getByTestId('toast-success').first()).toBeVisible();

      const payments = await (await request.get(`${API}/students/${student.id}/payments`)).json();
      expect(payments.total).toBe(1);
      expect(payments.items[0].amount).toBe(1000);
    } finally {
      await deleteStudent(request, student.id);
    }
    expect(errors).toEqual([]);
  });

  test('форма оплаты показывает ошибки валидации', async ({ page }, info) => {
    await page.goto('/');
    await page.getByTestId('add-payment-open').click();
    const sheet = page.getByTestId('payment-sheet');
    await sheet.getByTestId('payment-submit').click();
    await expect(sheet.getByText(/ученик/i).first()).toBeVisible();
    await expect(sheet.locator('[aria-invalid="true"]').first()).toBeVisible();
    await shot(page, info, '06-payment-validation');
  });
});
