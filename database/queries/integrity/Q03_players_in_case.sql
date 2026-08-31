-- Q03: All players involved in one case.
-- V003 bind: :case_id = 1
SELECT
    p.person_id AS player_id,
    p.first_name,
    p.last_name,
    pl.player_role,
    i.admin_id AS investigator_id
FROM involves_in ii
JOIN player pl
    ON pl.person_id = ii.person_id
JOIN person p
    ON p.person_id = pl.person_id
LEFT JOIN investigates i
    ON i.person_id = ii.person_id
   AND i.case_id = ii.case_id
   AND i.is_deleted = 0
WHERE ii.case_id = :case_id
  AND ii.is_deleted = 0
  AND pl.is_deleted = 0
  AND p.is_deleted = 0
ORDER BY p.last_name, p.first_name, p.person_id;
