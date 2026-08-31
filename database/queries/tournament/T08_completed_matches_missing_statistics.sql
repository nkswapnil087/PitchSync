-- T08: Completed matches with no batting, bowling, or fielding rows.
-- Core topics: multiple NOT EXISTS subqueries.

SELECT m.match_id,
       t.tournament_name,
       t.season_year,
       m.match_date,
       m.venue,
       m.result
FROM match m
JOIN tournament t ON t.tournament_id = m.tournament_id
WHERE m.match_status = 'COMPLETED'
  AND m.is_deleted = 0 AND t.is_deleted = 0
  AND NOT EXISTS (
      SELECT 1 FROM batting_performance bp
      WHERE bp.match_id = m.match_id AND bp.is_deleted = 0
  )
  AND NOT EXISTS (
      SELECT 1 FROM bowling_performance bop
      WHERE bop.match_id = m.match_id AND bop.is_deleted = 0
  )
  AND NOT EXISTS (
      SELECT 1 FROM fielding_performance fp
      WHERE fp.match_id = m.match_id AND fp.is_deleted = 0
  )
ORDER BY m.match_date, m.match_id;
