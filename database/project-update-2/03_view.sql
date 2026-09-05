--------------------------------------------------------------------------------
-- Requirement: 3. View
-- Business Purpose in PitchSync: Provide a simplified, unified career overview 
-- for players, combining their personal identity with their aggregated career
-- records and runs (using the PU2_FN_PLAYER_TOTAL_RUNS function).
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

CREATE OR REPLACE VIEW PU2_V_PLAYER_CAREER_OVERVIEW AS
SELECT 
    p.person_id,
    p.first_name,
    p.last_name,
    pl.player_role,
    COUNT(cr.record_id) AS total_career_records,
    PU2_FN_PLAYER_TOTAL_RUNS(p.person_id) AS total_runs
FROM person p
JOIN player pl ON p.person_id = pl.person_id
LEFT JOIN career_record cr ON p.person_id = cr.person_id AND cr.is_deleted = 0
WHERE p.is_deleted = 0
  AND pl.is_deleted = 0
GROUP BY 
    p.person_id,
    p.first_name,
    p.last_name,
    pl.player_role;


SELECT * 
FROM PU2_V_PLAYER_CAREER_OVERVIEW
ORDER BY total_runs DESC
FETCH FIRST 5 ROWS ONLY;

