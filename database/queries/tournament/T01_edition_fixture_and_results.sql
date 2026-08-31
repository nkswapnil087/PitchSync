-- T01: Full fixture and results list for a tournament edition.
-- Core topics: joins and LISTAGG.
-- Demo binds: :tournament_name = 'National T20 Championship', :season_year = 2026

SELECT m.match_id,
       m.match_date,
       m.venue,
       m.match_format,
       LISTAGG(te.team_name, ' vs ') WITHIN GROUP (ORDER BY te.team_id) AS teams,
       m.match_status,
       m.result,
       wt.team_name AS winner
FROM tournament tr
JOIN match m ON m.tournament_id = tr.tournament_id
JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
JOIN team te ON te.team_id = i.team_id AND te.is_deleted = 0
LEFT JOIN team wt ON wt.team_id = m.winner_team_id AND wt.is_deleted = 0
WHERE tr.tournament_name = :tournament_name
  AND tr.season_year = :season_year
  AND tr.is_deleted = 0
  AND m.is_deleted = 0
GROUP BY m.match_id, m.match_date, m.venue, m.match_format,
         m.match_status, m.result, wt.team_name
ORDER BY m.match_date, m.match_id;
