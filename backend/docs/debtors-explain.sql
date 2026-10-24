-- npm run seed:large (10 000 students, 299 550 payments), month = 2026-09
EXPLAIN (ANALYZE, BUFFERS)
WITH paid AS (
  SELECT student_id, SUM(amount)::int AS paid
  FROM payments
  WHERE paid_at >= '2026-09-01'::date AND paid_at < '2026-10-01'::date
  GROUP BY student_id
),
debtors AS (
  SELECT s.id, s.name, s.phone, s.group_name AS "group", s.monthly_fee AS "monthlyFee",
         COALESCE(p.paid, 0) AS paid, s.monthly_fee - COALESCE(p.paid, 0) AS debt
  FROM students s LEFT JOIN paid p ON p.student_id = s.id
  WHERE s.created_at < ('2026-10-01'::date::timestamp AT TIME ZONE 'Asia/Tashkent')
    AND COALESCE(p.paid, 0) < s.monthly_fee
)
SELECT id, name, phone, "group", "monthlyFee", paid, debt,
       COUNT(*) OVER () AS total, SUM(debt) OVER () AS "totalDebt"
FROM debtors ORDER BY debt DESC, name ASC, id ASC LIMIT 50 OFFSET 0;

--                                                                                    QUERY PLAN                                                                                    
-- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
--  Limit  (cost=3068.92..3069.04 rows=50 width=92) (actual time=22.752..22.764 rows=50 loops=1)
--    Buffers: shared hit=2063
--    ->  Sort  (cost=3068.92..3077.25 rows=3333 width=92) (actual time=22.750..22.758 rows=50 loops=1)
--          Sort Key: ((s.monthly_fee - COALESCE(p.paid, 0))) DESC, s.name, s.id
--          Sort Method: top-N heapsort  Memory: 36kB
--          Buffers: shared hit=2063
--          ->  WindowAgg  (cost=2606.28..2958.20 rows=3333 width=92) (actual time=21.414..21.898 rows=2767 loops=1)
--                Buffers: shared hit=2057
--                ->  Hash Left Join  (cost=2606.28..2891.54 rows=3333 width=72) (actual time=16.534..20.195 rows=2767 loops=1)
--                      Hash Cond: (s.id = p.student_id)
--                      Filter: (COALESCE(p.paid, 0) < s.monthly_fee)
--                      Rows Removed by Filter: 7233
--                      Buffers: shared hit=2057
--                      ->  Seq Scan on students s  (cost=0.00..259.00 rows=10000 width=68) (actual time=0.007..1.984 rows=10000 loops=1)
--                            Filter: (created_at < '2026-09-30 19:00:00+00'::timestamp with time zone)
--                            Buffers: shared hit=134
--                      ->  Hash  (cost=2516.44..2516.44 rows=7187 width=8) (actual time=16.459..16.463 rows=9333 loops=1)
--                            Buckets: 16384 (originally 8192)  Batches: 1 (originally 1)  Memory Usage: 493kB
--                            Buffers: shared hit=1923
--                            ->  Subquery Scan on p  (cost=2354.73..2516.44 rows=7187 width=8) (actual time=12.304..14.663 rows=9333 loops=1)
--                                  Buffers: shared hit=1923
--                                  ->  HashAggregate  (cost=2354.73..2444.57 rows=7187 width=8) (actual time=12.302..13.945 rows=9333 loops=1)
--                                        Group Key: payments.student_id
--                                        Batches: 1  Memory Usage: 1169kB
--                                        Buffers: shared hit=1923
--                                        ->  Bitmap Heap Scan on payments  (cost=187.51..2292.68 rows=12411 width=8) (actual time=1.169..8.277 rows=12423 loops=1)
--                                              Recheck Cond: ((paid_at >= '2026-09-01'::date) AND (paid_at < '2026-10-01'::date))
--                                              Heap Blocks: exact=1908
--                                              Buffers: shared hit=1923
--                                              ->  Bitmap Index Scan on payments_paid_at_idx  (cost=0.00..184.41 rows=12411 width=0) (actual time=0.938..0.939 rows=12423 loops=1)
--                                                    Index Cond: ((paid_at >= '2026-09-01'::date) AND (paid_at < '2026-10-01'::date))
--                                                    Buffers: shared hit=15
--  Planning:
--    Buffers: shared hit=247
--  Planning Time: 1.177 ms
--  Execution Time: 23.311 ms
-- (36 rows)
-- 
