-- Q02: Cases/involvements assigned to one investigator.
-- V003 bind: :admin_id = 200005

SELECT
    i.admin_id,
    ii.case_id,
    c.status,
    c.date_opened,
    ii.person_id AS player_id,
    p.first_name || ' ' || p.last_name AS player_name
FROM investigates i
JOIN involves_in ii
    ON ii.person_id = i.person_id
   AND ii.case_id = i.case_id
JOIN case_record c
    ON c.case_id = ii.case_id
JOIN person p
    ON p.person_id = ii.person_id
WHERE i.admin_id = :admin_id
  AND i.is_deleted = 0
  AND ii.is_deleted = 0
  AND c.is_deleted = 0
  AND p.is_deleted = 0
ORDER BY c.date_opened DESC, ii.case_id DESC, ii.person_id;
