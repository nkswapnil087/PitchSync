-- Q06: Unresolved cases that do not yet have active evidence.

SELECT c.case_id,
       c.status,
       c.date_opened
FROM case_record c
WHERE c.status IN ('OPEN', 'UNDER_INVESTIGATION', 'REFERRED')
  AND c.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1
      FROM evidence e
      WHERE e.case_id = c.case_id
        AND e.is_deleted = 0
  )
ORDER BY c.date_opened, c.case_id;
