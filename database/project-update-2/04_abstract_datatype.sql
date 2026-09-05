--------------------------------------------------------------------------------
-- Requirement: 4. Abstract datatype / Oracle object type
-- Business Purpose in PitchSync: Demonstrate interacting with complex datatypes
-- (ADDRESS_TYPE) used in the person table for present and permanent addresses, 
-- ensuring addresses stay structurally consistent across Bangladesh divisions.
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

SELECT address_type('House 10, Road 5', 'Mirpur', 'Dhaka', 'Dhaka') AS sample_address
FROM dual;

SELECT 
    p.person_id,
    p.first_name || ' ' || p.last_name AS name,
    p.present_address.address_line AS address_line,
    p.present_address.district AS district
FROM person p
WHERE p.present_address IS NOT NULL
  AND p.is_deleted = 0
FETCH FIRST 5 ROWS ONLY;

