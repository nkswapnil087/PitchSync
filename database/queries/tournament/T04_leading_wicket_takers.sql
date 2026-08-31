-- T04: Leading wicket takers in one tournament edition.
-- Core topics: aggregate calculations and HAVING.
-- Demo binds: :tournament_id = 1, :minimum_wickets = 1

SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       COUNT(DISTINCT bop.match_id) AS innings_bowled,
       SUM(bop.wickets_taken) AS total_wickets,
       SUM(bop.runs_conceded) AS runs_conceded,
       ROUND(SUM(bop.runs_conceded) * 6 / NULLIF(SUM(bop.balls_bowled), 0), 2)
           AS overall_economy_rate
FROM match m
JOIN bowling_performance bop ON bop.match_id = m.match_id
JOIN bowling_summary bos ON bos.bowl_summary_id = bop.bowl_summary_id
JOIN career_record cr ON cr.record_id = bos.record_id
JOIN person p ON p.person_id = cr.person_id
WHERE m.tournament_id = :tournament_id
  AND m.is_deleted = 0 AND bop.is_deleted = 0 AND bos.is_deleted = 0
  AND cr.is_deleted = 0 AND p.is_deleted = 0
GROUP BY p.person_id, p.first_name, p.last_name
HAVING SUM(bop.wickets_taken) >= :minimum_wickets
ORDER BY total_wickets DESC, overall_economy_rate, player_name;
