// Load test of every endpoint: 20 s, 10 connections. Usage: node qa/bench.mjs [baseUrl]
import autocannon from 'autocannon';

const BASE = process.argv[2] ?? process.env.API_URL ?? 'http://localhost:3000/api';
const DURATION = Number(process.env.DURATION ?? 20);
const CONNECTIONS = Number(process.env.CONNECTIONS ?? 10);

const ORIGIN = new URL(BASE).origin;
const PREFIX = new URL(BASE).pathname.replace(/\/$/, '');

const NORMS = { debtors: 200, students: 100, search: 100, payments: 50, write: 50 };

async function json(path, init) {
  const res = await fetch(BASE + path, init);
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} -> ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const month = new Date().toISOString().slice(0, 7);
const { items } = await json('/students?limit=100');
if (!items.length) throw new Error('No students: run npm run seed:large first');
const ids = items.map((s) => s.id);
const pick = () => ids[Math.floor(Math.random() * ids.length)];

const post = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

const cases = [
  { name: 'GET /debtors', norm: NORMS.debtors, requests: [{ path: PREFIX + `/debtors?month=${month}` }] },
  { name: 'GET /debtors (offset 5000)', norm: NORMS.debtors, requests: [{ path: PREFIX + `/debtors?month=${month}&offset=5000` }] },
  { name: 'GET /students', norm: NORMS.students, requests: [{ path: PREFIX + '/students' }] },
  { name: 'GET /students?search=', norm: NORMS.search, requests: [{ path: PREFIX + `/students?search=${encodeURIComponent('ал')}` }] },
  { name: 'GET /students/:id/payments', norm: NORMS.payments, requests: [{ setupRequest: (r) => ({ ...r, path: PREFIX + `/students/${pick()}/payments` }) }] },
  { name: 'POST /payments', norm: NORMS.write, requests: [{ method: 'POST', path: PREFIX + '/payments', headers: { 'content-type': 'application/json' }, setupRequest: (r) => ({ ...r, body: JSON.stringify({ studentId: pick(), amount: 1000, paidAt: `${month}-01` }) }) }] },
  { name: 'POST /students', norm: NORMS.write, requests: [{ method: 'POST', path: PREFIX + '/students', headers: { 'content-type': 'application/json' }, setupRequest: (r) => ({ ...r, body: JSON.stringify({ name: `Bench ${Math.random().toString(36).slice(2, 8)}`, phone: `+99890${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`, group: 'BENCH', monthlyFee: 500000 }) }) }] },
  { name: 'PATCH /students/:id', norm: NORMS.write, requests: [{ method: 'PATCH', headers: { 'content-type': 'application/json' }, setupRequest: (r) => ({ ...r, path: PREFIX + `/students/${pick()}`, body: JSON.stringify({ monthlyFee: 500000 + Math.floor(Math.random() * 100) * 1000 }) }) }] },
];

const rows = [];
for (const c of cases) {
  const r = await autocannon({ url: ORIGIN, connections: CONNECTIONS, duration: DURATION, requests: c.requests });
  rows.push({
    endpoint: c.name,
    p50: r.latency.p50,
    p95: r.latency.p90 + (r.latency.p97_5 - r.latency.p90) * (5 / 7.5), // interpolated
    p99: r.latency.p99,
    rps: Math.round(r.requests.average),
    non2xx: r.non2xx + r.errors,
    norm: c.norm,
  });
}

console.log('| Эндпоинт | p50, мс | p95, мс | p99, мс | RPS | ошибки | норма p95 | итог |');
console.log('|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  const ok = r.p95 <= r.norm && r.non2xx === 0;
  console.log(`| ${r.endpoint} | ${r.p50} | ${r.p95.toFixed(1)} | ${r.p99} | ${r.rps} | ${r.non2xx} | ≤ ${r.norm} | ${ok ? 'OK' : 'ПРЕВЫШЕНИЕ'} |`);
}

// cleanup bench students
let bench;
while ((bench = await json("/students?group=BENCH&limit=100")).items.length) {
  for (const s of bench.items) await fetch(`${BASE}/students/${s.id}`, { method: "DELETE" });
}
