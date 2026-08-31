-- P03: Match-by-match scorecard for a player in a tournament edition.
-- Core topics: joins across transaction, summary, and master tables.
-- Demo binds: :player_id = 100003, :tournament_id = 1, :season_year = 2026

SELECT m.match_id,
       m.match_date,
       m.venue,
       m.match_format,
       m.result,
       bp.runs_scored,
       bp.balls_faced,
       bp.strike_rate AS match_batting_strike_rate,
       bp.dismissal_type,
       bop.wickets_taken,
       bop.balls_bowled,
       bop.runs_conceded,
       bop.economy_rate AS match_economy_rate,
       fp.catches,
       fp.stumpings,
       fp.runs_out_direct
FROM tournament tr
JOIN match m ON m.tournament_id = tr.tournament_id
JOIN career_record cr ON cr.person_id = :player_id
LEFT JOIN batting_summary bs
       ON bs.record_id = cr.record_id
      AND bs.format = m.match_format
      AND bs.is_deleted = 0
LEFT JOIN batting_performance bp
       ON bp.bat_summary_id = bs.bat_summary_id
      AND bp.match_id = m.match_id
      AND bp.is_deleted = 0
LEFT JOIN bowling_summary bos
       ON bos.record_id = cr.record_id
      AND bos.format = m.match_format
      AND bos.is_deleted = 0
LEFT JOIN bowling_performance bop
       ON bop.bowl_summary_id = bos.bowl_summary_id
      AND bop.match_id = m.match_id
      AND bop.is_deleted = 0
LEFT JOIN fielding_summary fs
       ON fs.record_id = cr.record_id
      AND fs.format = m.match_format
      AND fs.is_deleted = 0
LEFT JOIN fielding_performance fp
       ON fp.field_summary_id = fs.field_summary_id
      AND fp.match_id = m.match_id
      AND fp.is_deleted = 0
WHERE tr.tournament_id = :tournament_id
  AND tr.season_year = :season_year
  AND tr.is_deleted = 0
  AND m.is_deleted = 0
  AND cr.is_deleted = 0
  AND (bp.bat_stat_id IS NOT NULL OR bop.bowl_stat_id IS NOT NULL OR fp.field_stat_id IS NOT NULL)
ORDER BY m.match_date, m.match_id;
