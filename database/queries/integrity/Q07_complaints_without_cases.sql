-- Q07: Active complaints that are not linked to an active case.

SELECT c.complaint_id,
       c.source_type,
       c.date_received,
       c.description,
       c.misconduct_type
FROM complaint c
WHERE c.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1
      FROM source_of s
      JOIN case_record cr
        ON cr.case_id = s.case_id
       AND cr.is_deleted = 0
      WHERE s.complaint_id = c.complaint_id
        AND s.is_deleted = 0
  )
ORDER BY c.date_received, c.complaint_id;
