-- A09: Players with a recorded match performance but no admin observation for that match.
-- Core topics: UNION, EXISTS-style derived data, NOT EXISTS.

WITH performed_in AS (
    SELECT cr.person_id AS player_id, bp.match_id
    FROM batting_performance bp
    JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id
    JOIN career_record cr ON cr.record_id = bs.record_id
    WHERE bp.is_deleted = 0 AND bs.is_deleted = 0 AND cr.is_deleted = 0
    UNION
    SELECT cr.person_id, bop.match_id
    FROM bowling_performance bop
    JOIN bowling_summary bos ON bos.bowl_summary_id = bop.bowl_summary_id
    JOIN career_record cr ON cr.record_id = bos.record_id
    WHERE bop.is_deleted = 0 AND bos.is_deleted = 0 AND cr.is_deleted = 0
    UNION
    SELECT cr.person_id, fp.match_id
    FROM fielding_performance fp
    JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id
    JOIN career_record cr ON cr.record_id = fs.record_id
    WHERE fp.is_deleted = 0 AND fs.is_deleted = 0 AND cr.is_deleted = 0
)
SELECT pi.match_id,
       m.match_date,
       t.tournament_name,
       p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name
FROM performed_in pi
JOIN match m ON m.match_id = pi.match_id
JOIN tournament t ON t.tournament_id = m.tournament_id
JOIN person p ON p.person_id = pi.player_id
WHERE NOT EXISTS (
          SELECT 1 FROM observes o
          WHERE o.match_id = pi.match_id
            AND o.player_id = pi.player_id
            AND o.is_deleted = 0
      )
  AND m.is_deleted = 0 AND t.is_deleted = 0 AND p.is_deleted = 0
ORDER BY m.match_date, pi.match_id, player_name;
