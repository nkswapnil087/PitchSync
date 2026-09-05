--------------------------------------------------------------------------------
-- Requirement: 1. Function
-- Business Purpose in PitchSync: Calculate the total career runs for a specific
-- player across all their batting performance summaries. Helpful for leaderboards
-- and reporting without recalculating aggregates repeatedly.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

CREATE OR REPLACE FUNCTION FN_PLAYER_TOTAL_RUNS (
    p_person_id IN NUMBER
) RETURN NUMBER IS
    v_total_runs NUMBER;
BEGIN
    SELECT NVL(SUM(bs.total_runs), 0)
    INTO v_total_runs
    FROM career_record cr
    JOIN batting_summary bs ON cr.record_id = bs.record_id
    WHERE cr.person_id = p_person_id
      AND cr.is_deleted = 0
      AND bs.is_deleted = 0;
      
    RETURN v_total_runs;
END;
/


SELECT
    p.person_id,
    p.first_name || ' ' || p.last_name AS player_name,
    FN_PLAYER_TOTAL_RUNS(p.person_id) AS total_career_runs
FROM person p
JOIN player pl ON p.person_id = pl.person_id
WHERE p.is_deleted = 0 AND pl.is_deleted = 0
ORDER BY p.person_id
FETCH FIRST 5 ROWS ONLY;

