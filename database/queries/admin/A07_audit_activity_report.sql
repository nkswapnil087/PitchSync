-- A07: Audit activity by actor and entity within a date range.
-- Core topics: date filtering, LEFT JOIN, GROUP BY.
-- Example binds: :date_from = DATE '2026-01-01', :date_to = DATE '2026-12-31'

SELECT al.actor_person_id,
       NVL(p.first_name || ' ' || p.last_name, 'SYSTEM/UNKNOWN') AS actor_name,
       al.entity_name,
       al.operation,
       COUNT(*) AS action_count,
       MIN(al.action_timestamp) AS first_action,
       MAX(al.action_timestamp) AS last_action
FROM audit_log al
LEFT JOIN person p
       ON p.person_id = al.actor_person_id
      AND p.is_deleted = 0
WHERE al.action_timestamp >= CAST(:date_from AS DATE)
  AND al.action_timestamp < CAST(:date_to AS DATE) + 1
  AND al.is_deleted = 0
GROUP BY al.actor_person_id, p.first_name, p.last_name,
         al.entity_name, al.operation
ORDER BY action_count DESC, actor_name, al.entity_name;
