-- T03: Leading run scorers in one tournament edition.
-- Core topics: multi-table joins, GROUP BY, HAVING.
-- Demo binds: :tournament_id = 1, :minimum_runs = 25

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       COUNT(DISTINCT bp.match_id) AS innings_recorded,
       SUM(bp.runs_scored) AS total_runs,
       MAX(bp.runs_scored) AS highest_score,
       ROUND(SUM(bp.runs_scored) * 100 / NULLIF(SUM(bp.balls_faced), 0), 2)
           AS overall_strike_rate
FROM match m
JOIN batting_performance bp ON bp.match_id = m.match_id
JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id
JOIN career_record cr ON cr.record_id = bs.record_id
JOIN person p ON p.person_id = cr.person_id
WHERE m.tournament_id = :tournament_id
  AND m.is_deleted = 0 AND bp.is_deleted = 0 AND bs.is_deleted = 0
  AND cr.is_deleted = 0 AND p.is_deleted = 0
GROUP BY p.person_id, p.first_name, p.last_name
HAVING SUM(bp.runs_scored) >= :minimum_runs
ORDER BY total_runs DESC, overall_strike_rate DESC, player_name;
