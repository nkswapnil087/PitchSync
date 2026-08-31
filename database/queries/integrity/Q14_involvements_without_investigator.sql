-- Q14: Active player involvements without an investigator assignment.

SELECT ii.case_id,
       ii.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       c.status,
       c.date_opened
FROM involves_in ii
JOIN player pl
  ON pl.person_id = ii.person_id
 AND pl.is_deleted = 0
JOIN person p
  ON p.person_id = pl.person_id
 AND p.is_deleted = 0
JOIN case_record c
  ON c.case_id = ii.case_id
 AND c.is_deleted = 0
WHERE ii.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1
      FROM investigates i
      WHERE i.person_id = ii.person_id
        AND i.case_id = ii.case_id
        AND i.is_deleted = 0
  )
ORDER BY c.date_opened, ii.case_id, player_name;
