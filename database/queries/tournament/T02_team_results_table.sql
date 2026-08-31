-- T02: Team results table for an edition (not an official points table).
-- Core topics: conditional aggregation with CASE.
-- Demo bind: :tournament_id = 1

SELECT t.team_id,
       t.team_name,
       COUNT(i.match_id) AS scheduled_matches,
       SUM(CASE WHEN m.match_status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_matches,
       SUM(CASE WHEN m.winner_team_id = t.team_id THEN 1 ELSE 0 END) AS wins,
       SUM(CASE WHEN m.match_status = 'COMPLETED'
                 AND (m.winner_team_id <> t.team_id OR m.winner_team_id IS NULL)
                THEN 1 ELSE 0 END) AS non_wins,
       SUM(CASE WHEN m.match_status = 'SCHEDULED' THEN 1 ELSE 0 END) AS upcoming_matches
FROM includes i
JOIN match m ON m.match_id = i.match_id
JOIN team t ON t.team_id = i.team_id
WHERE m.tournament_id = :tournament_id
  AND i.is_deleted = 0 AND m.is_deleted = 0 AND t.is_deleted = 0
GROUP BY t.team_id, t.team_name
ORDER BY wins DESC, completed_matches DESC, t.team_name;
