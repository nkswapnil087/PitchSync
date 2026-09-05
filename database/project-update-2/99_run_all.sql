--------------------------------------------------------------------------------
-- PitchSync Project Update 2 - Master Execution Script
-- Demonstrates 7 DBMS Requirements for Oracle SQL Developer
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;
SET VERIFY OFF;


@@01_function.sql
@@02_subquery.sql
@@03_view.sql
@@04_abstract_datatype.sql
@@05_plsql_procedure.sql
@@06_cursor.sql
@@07_exception_handling.sql


COLUMN object_name FORMAT A35
COLUMN object_type FORMAT A20
COLUMN status FORMAT A10

SELECT object_name, object_type, status
FROM user_objects
WHERE object_name LIKE 'PU2\_%' ESCAPE '\'
ORDER BY object_type, object_name;


