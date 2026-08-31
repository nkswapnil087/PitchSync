-- Q12: One complaint with any linked active cases.
-- V003 bind: :complaint_id = 1

SELECT c.complaint_id,
       c.source_type,
       c.date_received,
       c.misconduct_type,
       c.description,
       cr.case_id,
       cr.status AS case_status,
       cr.date_opened,
       cr.referral_status
FROM complaint c
LEFT JOIN source_of s
       ON s.complaint_id = c.complaint_id
      AND s.is_deleted = 0
LEFT JOIN case_record cr
       ON cr.case_id = s.case_id
      AND cr.is_deleted = 0
WHERE c.complaint_id = :complaint_id
  AND c.is_deleted = 0
ORDER BY cr.date_opened, cr.case_id;
