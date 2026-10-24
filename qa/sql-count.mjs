// Counts SQL statements Postgres executes per HTTP request.
// Needs the db container started with `-c log_statement=all`. Usage: node qa/sql-count.mjs [baseUrl] [dbContainer]
import { execFileSync } from 'node:child_process';

const BASE = process.argv[2] ?? 'http://localhost:3000/api';
const DB = process.argv[3] ?? 'test-project-db-1';

const countStatements = () => {
  const out = execFileSync('sh', ['-c', `docker logs ${DB} 2>&1`], { encoding: 'utf8', maxBuffer: 1 << 30 });
  return out.split('\n').filter((l) => /LOG:\s+(statement|execute)/.test(l)).filter((l) => !/LOG:\s+(statement|execute)[^:]*:\s*(BEGIN|COMMIT|DEALLOCATE)/i.test(l))
    // docker healthcheck of the backend (`/api/health`) runs SELECT 1 every 10 s
    .filter((l) => !/LOG:\s+(statement|execute)[^:]*:\s*SELECT 1\s*$/i.test(l));
};

async function measure(label, path, init) {
  await fetch(BASE + '/students?limit=1'); // warm up connection, prepared stmts
  await new Promise((r) => setTimeout(r, 1000));
  const before = countStatements().length;
  const res = await fetch(BASE + path, init);
  await res.text();
  await new Promise((r) => setTimeout(r, 500));
  const lines = countStatements().slice(before);
  return { label, status: res.status, count: lines.length, lines };
}

// Month in the backend time zone (APP_TIMEZONE), not UTC: they differ in the first hours of a month.
const month = new Date().toLocaleDateString('sv-SE', { timeZone: process.env.APP_TIMEZONE ?? 'Asia/Tashkent' }).slice(0, 7);
const { items } = await (await fetch(BASE + '/students?limit=1')).json();
const id = items[0].id;
const json = (method, body) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

const created = await measure('POST /students', '/students', json('POST', { name: 'Sql Count', phone: '+998901112233', group: 'SQLCOUNT', monthlyFee: 500000 }));
const newId = (await (await fetch(BASE + '/students?group=SQLCOUNT&limit=1')).json()).items[0]?.id;
const results = [
  await measure('GET /debtors', `/debtors?month=${month}`),
  await measure('GET /students', '/students'),
  await measure('GET /students?search=', '/students?search=' + encodeURIComponent('ал')),
  await measure('GET /students/:id', `/students/${id}`),
  await measure('GET /students/:id/payments', `/students/${id}/payments`),
  await measure('POST /payments', '/payments', json('POST', { studentId: id, amount: 1000, paidAt: `${month}-01` })),
  created,
  await measure('PATCH /students/:id', `/students/${newId}`, json('PATCH', { monthlyFee: 600000 })),
  await measure('DELETE /students/:id', `/students/${newId}`, { method: 'DELETE' }),
];

console.log('| Запрос | HTTP | SQL-запросов | норма | итог |\n|---|---|---|---|---|');
for (const r of results) console.log(`| ${r.label} | ${r.status} | ${r.count} | ≤ 2 | ${r.count <= 2 ? 'OK' : 'ПРЕВЫШЕНИЕ'} |`);
if (process.env.VERBOSE) for (const r of results) console.log(`\n## ${r.label}\n` + r.lines.join('\n'));
