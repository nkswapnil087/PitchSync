--------------------------------------------------------------------------------
-- Requirement: 6. Cursor
-- Business Purpose in PitchSync: Generate a roster report for a specific team, 
-- listing all currently active players. Useful for printing match-day squad
-- checklists or team management summaries.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

DECLARE
    -- Explicit parameterized cursor
    CURSOR c_team_players(p_team_id NUMBER) IS
        SELECT p.first_name, p.last_name, pl.player_role
        FROM plays_for pf
        JOIN person p ON pf.person_id = p.person_id
        JOIN player pl ON p.person_id = pl.person_id
        WHERE pf.team_id = p_team_id
          AND pf.end_date IS NULL
          AND pf.is_deleted = 0
          AND p.is_deleted = 0
          AND pl.is_deleted = 0
        ORDER BY p.last_name;
          
    v_team_id   team.team_id%TYPE;
    v_team_name team.team_name%TYPE;
    v_count     NUMBER := 0;
BEGIN
    -- Dynamically find a team to demonstrate, preferably one with players
    BEGIN
        SELECT t.team_id, t.team_name
        INTO v_team_id, v_team_name
        FROM team t
        WHERE t.is_deleted = 0
          AND EXISTS (
              SELECT 1 FROM plays_for pf 
              WHERE pf.team_id = t.team_id AND pf.end_date IS NULL AND pf.is_deleted = 0
          )
        FETCH FIRST 1 ROWS ONLY;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            -- Fallback if no team has players
            SELECT team_id, team_name
            INTO v_team_id, v_team_name
            FROM team
            WHERE is_deleted = 0
            FETCH FIRST 1 ROWS ONLY;
    END;
    
    DBMS_OUTPUT.PUT_LINE('Current Active Roster for Team: ' || v_team_name);
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
    
    -- Iterate using a cursor FOR loop
    FOR r_player IN c_team_players(v_team_id) LOOP
        v_count := v_count + 1;
        DBMS_OUTPUT.PUT_LINE(v_count || '. ' || r_player.first_name || ' ' || 
                             r_player.last_name || ' - Role: ' || r_player.player_role);
    END LOOP;
    
    IF v_count = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No active players found for this team.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
        DBMS_OUTPUT.PUT_LINE('Total Players: ' || v_count);
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No teams found in the database to demonstrate.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Unexpected error: ' || SQLERRM);
END;
/

