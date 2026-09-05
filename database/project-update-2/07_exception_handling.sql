--------------------------------------------------------------------------------
-- Requirement: 7. Exception handling
-- Business Purpose in PitchSync: Safely handle lookups for player records during
-- integration or data migration tasks. Prevents the entire batch from crashing
-- if a specific player ID is missing or if they have an invalid role recorded.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

DECLARE
    e_invalid_role EXCEPTION;
    
    -- Local procedure to isolate exception handling logic
    PROCEDURE lookup_player(p_id NUMBER) IS
        v_role player.player_role%TYPE;
        v_name person.first_name%TYPE;
    BEGIN
        SELECT p.first_name, pl.player_role
        INTO v_name, v_role
        FROM person p
        JOIN player pl ON p.person_id = pl.person_id
        WHERE p.person_id = p_id
          AND p.is_deleted = 0
          AND pl.is_deleted = 0;
          
        -- Custom business logic validation
        IF v_role = 'UNKNOWN' THEN
            RAISE e_invalid_role;
        END IF;
        
        DBMS_OUTPUT.PUT_LINE('SUCCESS: Found player ' || v_name || ' (Role: ' || v_role || ')');
        
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('HANDLED ERROR: Player ID ' || p_id || ' does not exist or is deleted.');
        WHEN e_invalid_role THEN
            DBMS_OUTPUT.PUT_LINE('HANDLED ERROR: Player ID ' || p_id || ' has an invalid role configuration.');
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('UNEXPECTED ERROR: ' || SQLERRM);
    END lookup_player;

BEGIN
    DBMS_OUTPUT.PUT_LINE('--- Testing Valid Lookup ---');
    -- Try to find an existing one, if none, skip
    FOR r IN (SELECT person_id FROM player WHERE is_deleted = 0 FETCH FIRST 1 ROWS ONLY) LOOP
        lookup_player(r.person_id);
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('--- Testing Invalid Lookup (NO_DATA_FOUND) ---');
    lookup_player(-999); -- -999 is guaranteed to not be in the sequence
    
    DBMS_OUTPUT.PUT_LINE('Demonstration finished cleanly.');
END;
/

