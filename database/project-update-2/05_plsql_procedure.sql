--------------------------------------------------------------------------------
-- Requirement: 5. PL/SQL Procedure
-- Business Purpose in PitchSync: Generate and print a text-based summary of a
-- player's performance level. Can be used for automated weekly reports or 
-- debug outputs during admin reviews.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE PU2_PR_PLAYER_SUMMARY (
    p_person_id IN NUMBER
) IS
    v_first_name person.first_name%TYPE;
    v_last_name  person.last_name%TYPE;
    v_role       player.player_role%TYPE;
    v_total_runs NUMBER;
BEGIN
    -- Use SELECT INTO to get person details
    SELECT p.first_name, p.last_name, pl.player_role
    INTO v_first_name, v_last_name, v_role
    FROM person p
    JOIN player pl ON p.person_id = pl.person_id
    WHERE p.person_id = p_person_id
      AND p.is_deleted = 0;
      
    -- Get runs using the function created in 01_function.sql
    v_total_runs := PU2_FN_PLAYER_TOTAL_RUNS(p_person_id);
    
    DBMS_OUTPUT.PUT_LINE('--- PLAYER SUMMARY ---');
    DBMS_OUTPUT.PUT_LINE('Name : ' || v_first_name || ' ' || v_last_name);
    DBMS_OUTPUT.PUT_LINE('Role : ' || v_role);
    DBMS_OUTPUT.PUT_LINE('Runs : ' || v_total_runs);
    
    -- Conditional logic based on total runs
    IF v_total_runs >= 5000 THEN
        DBMS_OUTPUT.PUT_LINE('Status: Legendary Batter');
    ELSIF v_total_runs >= 1000 THEN
        DBMS_OUTPUT.PUT_LINE('Status: Established Batter');
    ELSIF v_total_runs > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Status: Developing Batter');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Status: Bowler / No runs recorded');
    END IF;
    DBMS_OUTPUT.PUT_LINE('----------------------');
END;
/


DECLARE
    v_test_person_id NUMBER;
BEGIN
    -- Dynamically select the first available active player for demonstration
    SELECT MIN(person_id)
    INTO v_test_person_id
    FROM player
    WHERE is_deleted = 0;
    
    IF v_test_person_id IS NOT NULL THEN
        PU2_PR_PLAYER_SUMMARY(v_test_person_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('No active player found for demonstration.');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error during demonstration: ' || SQLERRM);
END;
/

