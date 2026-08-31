-- P04: Players whose batting average is above their current team's average.
-- Core topics: correlated subquery and AVG.
-- Demo bind: :match_format = 'T20'

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       t.team_name,
       bs.batting_avg,
       ROUND((
           SELECT AVG(bs2.batting_avg)
           FROM plays_for pf2
           JOIN career_record cr2
             ON cr2.person_id = pf2.person_id
            AND cr2.team_id = pf2.team_id
            AND cr2.is_deleted = 0
           JOIN batting_summary bs2
             ON bs2.record_id = cr2.record_id
            AND bs2.format = :match_format
            AND bs2.is_deleted = 0
           WHERE pf2.team_id = pf.team_id
             AND pf2.end_date IS NULL
             AND pf2.is_deleted = 0
       ), 2) AS team_batting_average
FROM plays_for pf
JOIN team t ON t.team_id = pf.team_id
JOIN career_record cr
  ON cr.person_id = pf.person_id
 AND cr.team_id = pf.team_id
JOIN batting_summary bs
  ON bs.record_id = cr.record_id
 AND bs.format = :match_format
JOIN person p ON p.person_id = pf.person_id
WHERE pf.end_date IS NULL
  AND pf.is_deleted = 0 AND t.is_deleted = 0
  AND cr.is_deleted = 0 AND bs.is_deleted = 0 AND p.is_deleted = 0
  AND bs.batting_avg > (
      SELECT AVG(bs2.batting_avg)
      FROM plays_for pf2
      JOIN career_record cr2
        ON cr2.person_id = pf2.person_id
       AND cr2.team_id = pf2.team_id
       AND cr2.is_deleted = 0
      JOIN batting_summary bs2
        ON bs2.record_id = cr2.record_id
       AND bs2.format = :match_format
       AND bs2.is_deleted = 0
      WHERE pf2.team_id = pf.team_id
        AND pf2.end_date IS NULL
        AND pf2.is_deleted = 0
  )
ORDER BY t.team_name, bs.batting_avg DESC;
