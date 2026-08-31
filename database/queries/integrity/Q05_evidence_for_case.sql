-- Q05: All evidence belonging to one case.
-- V003 bind: :case_id = 2
SELECT
    e.case_id,
    e.evidence_no,
    e.description,
    e.collected_date
FROM evidence e
WHERE e.case_id = :case_id
  AND e.is_deleted = 0
ORDER BY e.evidence_no;
