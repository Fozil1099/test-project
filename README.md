# Учёт оплат учебного центра

Мини-сервис: ученики, оплаты и должники за месяц.

Монорепо:
- `backend/` — NestJS + Prisma + PostgreSQL
- `frontend/` — React + Vite + TypeScript, мобильная веб-страница
- `docker-compose.yml` — БД, backend, frontend

## Запуск

Нужен только Docker.

```bash
git clone https://github.com/Fozil1099/test-project.git
cd test-project
cp .env.example .env
docker compose up --build
```

При старте backend сам применяет миграции и, если база пустая, добавляет демо-данные (20 учеников в 3 группах, часть из них должники за текущий месяц).

- Веб-страница (должники и оплата): http://localhost:8080 — удобнее всего открыть с телефона или в режиме мобильного устройства в DevTools
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

Остановить: `docker compose down` (с удалением данных: `docker compose down -v`).

### Frontend без Docker

Нужен Node.js 22. Подробнее в [frontend/README.md](frontend/README.md).

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173, /api проксируется на backend :3000
npm run dev:mock   # без backend, на моках MSW
```

### Backend без Docker (разработка)

Нужны Node.js 22 и PostgreSQL 16 (можно поднять только БД: `docker compose up -d db`).

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run seed          # демо-данные
npm run start:dev
```

Тесты:

```bash
npm test              # unit
npm run test:e2e      # e2e, нужна база из TEST_DATABASE_URL (по умолчанию payments_test)
```

Проверка скорости на больших данных:

```bash
npm run seed:large    # ВНИМАНИЕ: очищает таблицы; 10 000 учеников, ~300 000 оплат
node scripts/bench.mjs
```

## API

Префикс `/api`. Деньги — целые суммы в сумах. Даты — `YYYY-MM-DD`. Ошибки — `{ statusCode, message, error }`. Полное описание в Swagger (`/docs`).

| Метод | Путь | Описание |
|---|---|---|
| POST | /students | Создать ученика `{name, phone, group, monthlyFee}` |
| GET | /students | Список `?search=&group=&limit=50&offset=0` → `{items, total}` |
| GET | /students/:id | Ученик или 404 |
| PATCH | /students/:id | Изменить любые поля |
| DELETE | /students/:id | Удалить (204), оплаты удаляются вместе с ним |
| POST | /payments | Добавить оплату `{studentId, amount, paidAt}` |
| GET | /students/:id/payments | Оплаты ученика, новые сверху → `{items, total}` |
| GET | /debtors?month=YYYY-MM | Должники за месяц → `{month, items, total, totalDebt}` |

Пример:

```bash
curl "http://localhost:3000/api/debtors?month=2026-10"
```

```json
{
  "month": "2026-10",
  "items": [
    { "id": 20, "name": "Собирова Севара", "phone": "+998901150461", "group": "Backend-1",
      "monthlyFee": 700000, "paid": 0, "debt": 700000 }
  ],
  "total": 9,
  "totalDebt": 3800000
}
```

### Как считаются должники

Должник за месяц M — ученик, который был создан до конца M, и сумма его оплат с датой внутри M меньше `monthlyFee`. `debt = monthlyFee − paid`. Сортировка: по долгу (больше сверху), затем по имени.

Решения и допущения:
- Оплата относится к месяцу по своей дате `paidAt`, границы `[1-е число M; 1-е число M+1)`.
- Переплата не переносится на следующий месяц, а долг прошлых месяцев не копится: каждый месяц считается отдельно.
- Ученик, добавленный позже месяца, за этот месяц не должник. "Конец месяца" считается в часовом поясе `APP_TIMEZONE` (по умолчанию `Asia/Tashkent`); дата оплаты "не в будущем" — тоже.
- Весь расчёт — один SQL-запрос (CTE с суммой оплат за месяц, `LEFT JOIN`, оконные `COUNT/SUM` для `total` и `totalDebt`). На 10 000 учеников и 300 000 оплат ответ около 30 мс, план запроса: `backend/docs/debtors-explain.sql`.

Валидация: телефон `+998XXXXXXXXX`, имя 2–100 символов, группа 1–50, суммы — целые от 1 до 100 000 000.

Телефон не уникален: у нескольких учеников может быть один номер (например, братья и сёстры с телефоном родителя).

## Проверка качества

- Backend: unit и e2e-тесты (`backend/`, см. выше), в e2e проверяется и число SQL-запросов на HTTP-запрос.
- Браузерные тесты Playwright на мобильном и десктопном экране: `cd e2e && npm ci && npx playwright install chromium && npm run test:e2e` (нужен поднятый `docker compose`).
- Нагрузка и число SQL-запросов на 10 000 учеников / 300 000 оплат: `qa/bench.mjs`, `qa/sql-count.mjs`. Результаты, планы запросов и скриншоты — в [qa/REPORT.md](qa/REPORT.md).

## Что улучшить

Если бы была ещё неделя:

1. **Долг нарастающим итогом.** Сейчас каждый месяц считается отдельно, переплата не переносится. Добавил бы баланс ученика (начисления минус оплаты) и дату начала обучения, чтобы видеть общий долг за все месяцы и учитывать предоплату.
2. **Авторизация и роли.** Сейчас API открыт. Нужен вход для администратора и кассира, журнал, кто и когда принял оплату, и отмена ошибочной оплаты вместо удаления ученика.
3. **Группы как отдельная сущность.** Сейчас группа — строка. Отдельная таблица с ценой по умолчанию и расписанием убрала бы опечатки и позволила бы менять цену для всей группы.
4. **Напоминания должникам.** Telegram-бот (вариант А из задания) поверх того же API: `/debt`, `/pay`, плюс автоматическое напоминание должникам в начале месяца.
5. **Эксплуатация.** CI для frontend и e2e (сейчас в CI только backend), автоматические бэкапы БД, структурированные логи и метрики времени ответа.
