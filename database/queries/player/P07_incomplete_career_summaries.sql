-- P07: Career records missing one or more expected format-summary categories.
-- Core topics: NOT EXISTS and set-like completeness checks.
-- Demo bind: :match_format = 'T20'

SELECT cr.record_id,
       p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       t.team_name,
       CASE WHEN NOT EXISTS (
           SELECT 1 FROM batting_summary bs
           WHERE bs.record_id = cr.record_id
             AND bs.format = :match_format AND bs.is_deleted = 0
       ) THEN 'MISSING' ELSE 'PRESENT' END AS batting_summary,
       CASE WHEN NOT EXISTS (
           SELECT 1 FROM bowling_summary bos
           WHERE bos.record_id = cr.record_id
             AND bos.format = :match_format AND bos.is_deleted = 0
       ) THEN 'MISSING' ELSE 'PRESENT' END AS bowling_summary,
       CASE WHEN NOT EXISTS (
           SELECT 1 FROM fielding_summary fs
           WHERE fs.record_id = cr.record_id
             AND fs.format = :match_format AND fs.is_deleted = 0
       ) THEN 'MISSING' ELSE 'PRESENT' END AS fielding_summary
FROM career_record cr
JOIN person p ON p.person_id = cr.person_id
JOIN team t ON t.team_id = cr.team_id
WHERE cr.is_deleted = 0 AND p.is_deleted = 0 AND t.is_deleted = 0
  AND (NOT EXISTS (
           SELECT 1 FROM batting_summary bs
           WHERE bs.record_id = cr.record_id
             AND bs.format = :match_format AND bs.is_deleted = 0
       )
       OR NOT EXISTS (
           SELECT 1 FROM bowling_summary bos
           WHERE bos.record_id = cr.record_id
             AND bos.format = :match_format AND bos.is_deleted = 0
       )
       OR NOT EXISTS (
           SELECT 1 FROM fielding_summary fs
           WHERE fs.record_id = cr.record_id
             AND fs.format = :match_format AND fs.is_deleted = 0
       ))
ORDER BY t.team_name, player_name;
