-- T07: Summary for comparing editions of the same named tournament.
-- Core topics: correlated scalar subqueries and parameterized selection.
-- Demo bind: :tournament_name = 'National T20 Championship'

SELECT t.tournament_id,
       t.tournament_name,
       t.season_year,
       (SELECT COUNT(*)
        FROM match m
        WHERE m.tournament_id = t.tournament_id AND m.is_deleted = 0) AS total_matches,
       (SELECT COUNT(*)
        FROM match m
        WHERE m.tournament_id = t.tournament_id
          AND m.match_status = 'COMPLETED' AND m.is_deleted = 0) AS completed_matches,
       (SELECT COUNT(DISTINCT i.team_id)
        FROM match m JOIN includes i ON i.match_id = m.match_id
        WHERE m.tournament_id = t.tournament_id
          AND m.is_deleted = 0 AND i.is_deleted = 0) AS participating_teams,
       (SELECT NVL(SUM(bp.runs_scored), 0)
        FROM match m JOIN batting_performance bp ON bp.match_id = m.match_id
        WHERE m.tournament_id = t.tournament_id
          AND m.is_deleted = 0 AND bp.is_deleted = 0) AS recorded_runs,
       (SELECT NVL(SUM(bop.wickets_taken), 0)
        FROM match m JOIN bowling_performance bop ON bop.match_id = m.match_id
        WHERE m.tournament_id = t.tournament_id
          AND m.is_deleted = 0 AND bop.is_deleted = 0) AS recorded_wickets
FROM tournament t
WHERE t.tournament_name = :tournament_name
  AND t.is_deleted = 0
ORDER BY t.season_year DESC;
