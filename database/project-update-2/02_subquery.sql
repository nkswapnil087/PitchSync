--------------------------------------------------------------------------------
-- Requirement: 2. Subquery
-- Business Purpose in PitchSync: Identify outstanding players whose individual
-- career runs for a specific team exceed the average career runs of all players
-- who have played for that same team. Useful for MVP awards.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

SELECT 
    cr.person_id,
    p.first_name || ' ' || p.last_name AS player_name,
    t.team_name,
    bs.total_runs AS player_team_runs
FROM career_record cr
JOIN person p ON cr.person_id = p.person_id
JOIN team t ON cr.team_id = t.team_id
JOIN batting_summary bs ON cr.record_id = bs.record_id
WHERE cr.is_deleted = 0 
  AND bs.is_deleted = 0
  AND p.is_deleted = 0
  AND t.is_deleted = 0
  -- Outer query checks if the player's runs are greater than the team's average
  AND bs.total_runs > (
      -- Correlated inner subquery: calculates average runs for the SAME team
      SELECT AVG(bs2.total_runs)
      FROM career_record cr2
      JOIN batting_summary bs2 ON cr2.record_id = bs2.record_id
      WHERE cr2.team_id = cr.team_id -- correlated link
        AND cr2.is_deleted = 0
        AND bs2.is_deleted = 0
  )
ORDER BY t.team_name, bs.total_runs DESC;

