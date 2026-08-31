--how many unresolved cases are under one investigator
SET DEFINE OFF;
SELECT
    a.person_id AS investigator_id,
    p.first_name || ' ' || p.last_name AS investigator_name,
    COUNT(c.case_id) AS unresolved_assignments
FROM admin a
JOIN person p
    ON p.person_id = a.person_id
LEFT JOIN investigates i
    ON i.admin_id = a.person_id
   AND i.is_deleted = 0
LEFT JOIN case_record c
    ON c.case_id = i.case_id
   AND c.is_deleted = 0
   AND c.status IN (
       'OPEN',
       'UNDER_INVESTIGATION',
       'REFERRED'
   )
WHERE a.designation = 'Integrity & Compliance Officer'
  AND a.is_deleted = 0
  AND p.is_deleted = 0
GROUP BY
    a.person_id,
    p.first_name,
    p.last_name
ORDER BY unresolved_assignments DESC;
