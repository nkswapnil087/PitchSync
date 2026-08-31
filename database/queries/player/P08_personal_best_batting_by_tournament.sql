-- P08: A player's best batting performance in each tournament edition.
-- Core topics: correlated MAX subquery.
-- Demo bind: :player_id = 100003

SELECT t.tournament_name,
       t.season_year,
       m.match_id,
       m.match_date,
       bp.runs_scored,
       bp.balls_faced,
       bp.strike_rate,
       bp.dismissal_type
FROM batting_performance bp
JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id
JOIN career_record cr ON cr.record_id = bs.record_id
JOIN match m ON m.match_id = bp.match_id
JOIN tournament t ON t.tournament_id = m.tournament_id
WHERE cr.person_id = :player_id
  AND bp.runs_scored = (
      SELECT MAX(bp2.runs_scored)
      FROM batting_performance bp2
      JOIN batting_summary bs2 ON bs2.bat_summary_id = bp2.bat_summary_id
      JOIN career_record cr2 ON cr2.record_id = bs2.record_id
      JOIN match m2 ON m2.match_id = bp2.match_id
      WHERE cr2.person_id = cr.person_id
        AND m2.tournament_id = m.tournament_id
        AND bp2.is_deleted = 0 AND bs2.is_deleted = 0
        AND cr2.is_deleted = 0 AND m2.is_deleted = 0
  )
  AND bp.is_deleted = 0 AND bs.is_deleted = 0 AND cr.is_deleted = 0
  AND m.is_deleted = 0 AND t.is_deleted = 0
ORDER BY t.season_year DESC, t.tournament_name, m.match_id;
