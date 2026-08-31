-- T05: Venue usage and completion totals for a tournament edition.
-- Core topics: GROUP BY and conditional aggregation.
-- Demo binds: :tournament_id = 1, :season_year = 2026

SELECT m.venue,
       COUNT(*) AS total_matches,
       SUM(CASE WHEN m.match_status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_matches,
       SUM(CASE WHEN m.match_status = 'SCHEDULED' THEN 1 ELSE 0 END) AS scheduled_matches,
       MIN(m.match_date) AS first_match_date,
       MAX(m.match_date) AS last_match_date
FROM match m
JOIN tournament t ON t.tournament_id = m.tournament_id
WHERE t.tournament_id = :tournament_id
  AND t.season_year = :season_year
  AND t.is_deleted = 0
  AND m.is_deleted = 0
GROUP BY m.venue
ORDER BY total_matches DESC, m.venue;
