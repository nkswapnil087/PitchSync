-- P05: Performance-and-fitness shortlist for a particular format.
-- A player qualifies by the batting OR bowling threshold and must be match available.
-- Core topics: OR conditions, latest-record correlated subquery, joins.
-- Demo binds: :match_format = 'T20', :minimum_batting_average = 32, :maximum_bowling_average = 24

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       pl.player_role,
       t.team_name,
       bs.batting_avg,
       bos.bowling_avg,
       pf.injury_status,
       pf.fitness_clearance,
       pf.match_available
FROM person p
JOIN player pl ON pl.person_id = p.person_id
JOIN plays_for pt ON pt.person_id = pl.person_id AND pt.end_date IS NULL
JOIN team t ON t.team_id = pt.team_id
JOIN career_record cr ON cr.person_id = pl.person_id AND cr.team_id = t.team_id
LEFT JOIN batting_summary bs
       ON bs.record_id = cr.record_id
      AND bs.format = :match_format
      AND bs.is_deleted = 0
LEFT JOIN bowling_summary bos
       ON bos.record_id = cr.record_id
      AND bos.format = :match_format
      AND bos.is_deleted = 0
JOIN player_fitness pf ON pf.person_id = pl.person_id
WHERE pf.recorded_date = (
          SELECT MAX(pf2.recorded_date)
          FROM player_fitness pf2
          WHERE pf2.person_id = pf.person_id
            AND pf2.is_deleted = 0
      )
  AND pf.match_available = 'Y'
  AND (bs.batting_avg >= :minimum_batting_average
       OR bos.bowling_avg <= :maximum_bowling_average)
  AND p.is_deleted = 0 AND pl.is_deleted = 0 AND pt.is_deleted = 0
  AND t.is_deleted = 0 AND cr.is_deleted = 0 AND pf.is_deleted = 0
ORDER BY t.team_name, player_name;
