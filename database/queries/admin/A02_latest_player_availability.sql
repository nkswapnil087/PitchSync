-- A02: Latest fitness and availability status for all current players.
-- Core topics: LEFT JOIN and greatest-date correlated subquery.

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       pl.player_role,
       t.team_name,
       NVL(pf.injury_status, 'NOT RECORDED') AS injury_status,
       pf.recovery_status,
       pf.expected_return_date,
       NVL(pf.fitness_clearance, 'N') AS fitness_clearance,
       NVL(pf.training_available, 'N') AS training_available,
       NVL(pf.match_available, 'N') AS match_available,
       pf.recorded_date
FROM player pl
JOIN person p ON p.person_id = pl.person_id
LEFT JOIN plays_for pt
       ON pt.person_id = pl.person_id
      AND pt.end_date IS NULL AND pt.is_deleted = 0
LEFT JOIN team t ON t.team_id = pt.team_id AND t.is_deleted = 0
LEFT JOIN player_fitness pf
       ON pf.person_id = pl.person_id
      AND pf.is_deleted = 0
      AND pf.recorded_date = (
          SELECT MAX(pf2.recorded_date)
          FROM player_fitness pf2
          WHERE pf2.person_id = pl.person_id
            AND pf2.is_deleted = 0
      )
WHERE pl.is_deleted = 0 AND p.is_deleted = 0
ORDER BY match_available DESC, t.team_name, player_name;
