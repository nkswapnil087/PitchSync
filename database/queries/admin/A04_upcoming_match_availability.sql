-- A04: Roster availability counts for teams in upcoming matches.
-- Core topics: joins, conditional COUNT DISTINCT, latest-record subquery.
-- Demo bind: :from_date = DATE '2026-09-01'

SELECT m.match_id,
       m.match_date,
       m.venue,
       t.team_id,
       t.team_name,
       COUNT(DISTINCT pf.person_id) AS current_roster_size,
       COUNT(DISTINCT CASE WHEN f.match_available = 'Y' THEN pf.person_id END)
           AS match_available_players,
       COUNT(DISTINCT CASE WHEN f.match_available = 'N' OR f.person_id IS NULL
                           THEN pf.person_id END) AS unavailable_or_unassessed
FROM match m
JOIN includes i ON i.match_id = m.match_id
JOIN team t ON t.team_id = i.team_id
LEFT JOIN plays_for pf
       ON pf.team_id = t.team_id
      AND pf.end_date IS NULL AND pf.is_deleted = 0
LEFT JOIN player_fitness f
       ON f.person_id = pf.person_id
      AND f.is_deleted = 0
      AND f.recorded_date = (
          SELECT MAX(f2.recorded_date)
          FROM player_fitness f2
          WHERE f2.person_id = pf.person_id
            AND f2.is_deleted = 0
      )
WHERE m.match_status = 'SCHEDULED'
  AND m.match_date >= :from_date
  AND m.is_deleted = 0 AND i.is_deleted = 0 AND t.is_deleted = 0
GROUP BY m.match_id, m.match_date, m.venue, t.team_id, t.team_name
ORDER BY m.match_date, m.match_id, t.team_name;
