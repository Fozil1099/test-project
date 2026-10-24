// Every e2e worker talks to the test database, never to the dev one.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/payments_test?schema=public';
process.env.APP_TIMEZONE = 'Asia/Tashkent';
process.env.NODE_ENV = 'test';
