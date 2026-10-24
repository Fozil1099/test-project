# Frontend

Мобильная веб-страница учёта оплат: список должников за месяц, приём оплаты, ученики и история оплат.

React 18 + Vite + TypeScript, TanStack Query, React Router, Tailwind CSS, React Hook Form + Zod.
Архитектура: [Feature-Sliced Design](https://feature-sliced.design), границы слоёв проверяет Steiger (`npm run lint`).

## Запуск

```bash
npm ci
npm run dev        # http://localhost:5173, /api проксируется на http://localhost:3000
npm run dev:mock   # без бэкенда: API отвечает MSW из src/app/mocks (данные живут до перезагрузки)
npm run lint       # ESLint + Steiger (FSD)
npm run build
```

В Docker фронтенд собирается в статику и отдаётся nginx, который проксирует `/api` в сервис `backend:3000`.

## Структура

```
src/
  app/        провайдеры (QueryClient, Router, Toast), стили, моки MSW
  pages/      debtors, students, student-details
  widgets/    debtors-list, students-list, bottom-nav, page-header
  features/   add-payment, create-student, edit-student, delete-student, select-month, search-students
  entities/   student, payment, debtor (типы, запросы к API, карточки)
  shared/     api (http-клиент, query keys), ui-кит, lib (деньги, даты, debounce), config
```

## Решения

- Списки грузятся страницами по 50 (`limit/offset`), кнопка «Показать ещё».
- Выбор ученика в форме оплаты ищет на сервере с debounce 300 мс, весь список не грузится.
- `staleTime` 30 с и без refetch на фокус: переключение вкладок не повторяет запросы.
- После оплаты инвалидируются только `debtors` и оплаты этого ученика.
- Месяц хранится в URL (`/?month=2026-10`), страницу можно обновить или отправить ссылкой.
- Страницы грузятся лениво (`React.lazy`), MSW в production-сборку не попадает.
