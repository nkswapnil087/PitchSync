-- T09: Teams included in every match of a tournament.
-- Core topics: relational division using nested NOT EXISTS.
-- Demo bind: :tournament_id = 2 (both participating teams are in its one demo match)

SELECT t.team_id,
       t.team_name
FROM team t
WHERE t.is_deleted = 0
  AND EXISTS (
      SELECT 1
      FROM match m
      WHERE m.tournament_id = :tournament_id
        AND m.is_deleted = 0
  )
  AND NOT EXISTS (
      SELECT 1
      FROM match m
      WHERE m.tournament_id = :tournament_id
        AND m.is_deleted = 0
        AND NOT EXISTS (
            SELECT 1
            FROM includes i
            WHERE i.match_id = m.match_id
              AND i.team_id = t.team_id
              AND i.is_deleted = 0
        )
  )
ORDER BY t.team_name;
