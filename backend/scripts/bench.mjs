// Sequential latency check against a running backend seeded with `npm run seed:large`.
//   node scripts/bench.mjs [baseUrl]
const base = process.argv[2] ?? 'http://localhost:3000/api';
const json = (method, body) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

async function bench(name, url, init, n = 200) {
  const times = [];
  for (let i = 0; i < n + 10; i++) {
    const started = performance.now();
    const res = await fetch(base + url(i), init?.(i));
    await res.text();
    if (res.status >= 400) throw new Error(`${name}: HTTP ${res.status}`);
    if (i >= 10) times.push(performance.now() - started); // first 10 are warm-up
  }
  times.sort((a, b) => a - b);
  const p = (q) => times[Math.floor(q * (times.length - 1))].toFixed(1);
  console.log(`${name.padEnd(30)} p50 ${p(0.5).padStart(6)} ms   p95 ${p(0.95).padStart(6)} ms`);
}

const today = new Date();
const months = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
  return d.toISOString().slice(0, 7);
});
const names = ['Алиев', 'Азиз', 'Назаров Сардор', 'зарина'];

await bench('GET /debtors', (i) => `/debtors?month=${months[i % 12]}`);
await bench('GET /debtors (offset 2000)', (i) => `/debtors?month=${months[i % 12]}&offset=2000`);
await bench('GET /students', (i) => `/students?offset=${(i * 37) % 9000}`);
await bench('GET /students?search=name', (i) => `/students?search=${encodeURIComponent(names[i % 4])}`);
await bench('GET /students?search=phone', (i) => `/students?search=${1000 + i}`);
await bench('GET /students/:id/payments', (i) => `/students/${1 + ((i * 13) % 10000)}/payments`);
await bench('POST /payments', () => '/payments', (i) =>
  json('POST', { studentId: 1 + i, amount: 1000, paidAt: today.toISOString().slice(0, 10) }),
);
await bench('PATCH /students/:id', (i) => `/students/${1 + i}`, () =>
  json('PATCH', { monthlyFee: 500000 }),
);
