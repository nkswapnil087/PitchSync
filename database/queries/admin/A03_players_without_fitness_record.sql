-- A03: Active players without any current fitness record.
-- Core topics: NOT EXISTS.

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       pl.player_role,
       t.team_name
FROM player pl
JOIN person p ON p.person_id = pl.person_id
LEFT JOIN plays_for pf
       ON pf.person_id = pl.person_id
      AND pf.end_date IS NULL AND pf.is_deleted = 0
LEFT JOIN team t ON t.team_id = pf.team_id AND t.is_deleted = 0
WHERE pl.is_deleted = 0 AND p.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1
      FROM player_fitness f
      WHERE f.person_id = pl.person_id
        AND f.is_deleted = 0
  )
ORDER BY t.team_name, player_name;
