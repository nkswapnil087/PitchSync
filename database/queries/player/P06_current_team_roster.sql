-- P06: Current roster with role, career duration, and latest fitness status.
-- Core topics: LEFT JOIN and correlated subquery.
-- Demo bind: :team_id = 1

SELECT t.team_name,
       p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       pl.player_role,
       pf.start_date AS joined_team,
       cr.matches_played,
       NVL(f.injury_status, 'NOT RECORDED') AS injury_status,
       NVL(f.match_available, 'N') AS match_available
FROM team t
JOIN plays_for pf ON pf.team_id = t.team_id
JOIN player pl ON pl.person_id = pf.person_id
JOIN person p ON p.person_id = pl.person_id
LEFT JOIN career_record cr
       ON cr.person_id = pl.person_id
      AND cr.team_id = t.team_id
      AND cr.is_deleted = 0
LEFT JOIN player_fitness f
       ON f.person_id = pl.person_id
      AND f.is_deleted = 0
      AND f.recorded_date = (
          SELECT MAX(f2.recorded_date)
          FROM player_fitness f2
          WHERE f2.person_id = pl.person_id
            AND f2.is_deleted = 0
      )
WHERE t.team_id = :team_id
  AND pf.end_date IS NULL
  AND t.is_deleted = 0 AND pf.is_deleted = 0
  AND pl.is_deleted = 0 AND p.is_deleted = 0
ORDER BY pl.player_role, p.last_name, p.first_name;
