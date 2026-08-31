-- P02: All career statistics for a player in a format and location type.
-- This is the V003-supported equivalent of a Test-away report; opponent country is not stored.
-- Core topics: multiple LEFT JOINs and parameterized filtering.
-- Example binds: :player_id = 100003, :match_format = 'T20', :location_type = 'Domestic'

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       t.team_name,
       cr.tier_level,
       cr.location_type,
       cr.matches_played,
       bs.total_runs,
       bs.batting_avg,
       bs.strike_rate AS batting_strike_rate,
       bs.highest_score,
       bos.total_wickets,
       bos.bowling_avg,
       bos.best_bowling_figures,
       bos.economy_rate,
       fs.total_catches,
       fs.total_stumpings,
       fs.total_runouts
FROM career_record cr
JOIN person p ON p.person_id = cr.person_id
JOIN team t ON t.team_id = cr.team_id
LEFT JOIN batting_summary bs
       ON bs.record_id = cr.record_id
      AND bs.format = :match_format
      AND bs.is_deleted = 0
LEFT JOIN bowling_summary bos
       ON bos.record_id = cr.record_id
      AND bos.format = :match_format
      AND bos.is_deleted = 0
LEFT JOIN fielding_summary fs
       ON fs.record_id = cr.record_id
      AND fs.format = :match_format
      AND fs.is_deleted = 0
WHERE cr.person_id = :player_id
  AND cr.location_type = :location_type
  AND p.is_deleted = 0
  AND cr.is_deleted = 0
  AND t.is_deleted = 0
ORDER BY cr.start_date DESC;
