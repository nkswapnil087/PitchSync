SET PAGESIZE 200
SET LINESIZE 220
SET FEEDBACK ON
SET VERIFY OFF

PROMPT === SESSION TARGET ===
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,
       SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
FROM dual;

PROMPT === TABLE COUNT ===
SELECT COUNT(*) AS actual_table_count,
       32 AS expected_table_count,
       CASE WHEN COUNT(*) = 32 THEN 'PASS' ELSE 'REVIEW' END AS verification
FROM user_tables;

PROMPT === TABLE NAMES ===
SELECT table_name
FROM user_tables
ORDER BY table_name;

PROMPT === CONSTRAINT COUNTS ===
SELECT constraint_type,
       CASE constraint_type
           WHEN 'P' THEN 'PRIMARY KEY'
           WHEN 'R' THEN 'FOREIGN KEY'
           WHEN 'U' THEN 'UNIQUE'
           WHEN 'C' THEN 'CHECK / NOT NULL'
       END AS constraint_category,
       COUNT(*) AS constraint_count
FROM user_constraints
WHERE constraint_type IN ('P', 'R', 'U', 'C')
GROUP BY constraint_type
ORDER BY constraint_type;

PROMPT === CONSTRAINT COLUMNS ===
SELECT c.table_name,
       c.constraint_name,
       c.constraint_type,
       cc.column_name,
       cc.position,
       c.status,
       c.validated
FROM user_constraints c
LEFT JOIN user_cons_columns cc
       ON cc.constraint_name = c.constraint_name
      AND cc.table_name = c.table_name
WHERE c.constraint_type IN ('P', 'R', 'U', 'C')
ORDER BY c.table_name, c.constraint_name, cc.position;

PROMPT === ROW COUNTS ===
SELECT table_name, row_count
FROM (
    SELECT 'ADMIN' AS table_name, COUNT(*) AS row_count FROM admin
    UNION ALL SELECT 'AUDIT_LOG', COUNT(*) FROM audit_log
    UNION ALL SELECT 'BATTING_PERFORMANCE', COUNT(*) FROM batting_performance
    UNION ALL SELECT 'BATTING_SUMMARY', COUNT(*) FROM batting_summary
    UNION ALL SELECT 'BOWLING_PERFORMANCE', COUNT(*) FROM bowling_performance
    UNION ALL SELECT 'BOWLING_SUMMARY', COUNT(*) FROM bowling_summary
    UNION ALL SELECT 'CAREER_RECORD', COUNT(*) FROM career_record
    UNION ALL SELECT 'CASE_RECORD', COUNT(*) FROM case_record
    UNION ALL SELECT 'COMPLAINT', COUNT(*) FROM complaint
    UNION ALL SELECT 'EVIDENCE', COUNT(*) FROM evidence
    UNION ALL SELECT 'FIELDING_PERFORMANCE', COUNT(*) FROM fielding_performance
    UNION ALL SELECT 'FIELDING_SUMMARY', COUNT(*) FROM fielding_summary
    UNION ALL SELECT 'INCLUDES', COUNT(*) FROM includes
    UNION ALL SELECT 'INVESTIGATES', COUNT(*) FROM investigates
    UNION ALL SELECT 'INVOLVES_IN', COUNT(*) FROM involves_in
    UNION ALL SELECT 'MATCH', COUNT(*) FROM match
    UNION ALL SELECT 'MENTORS', COUNT(*) FROM mentors
    UNION ALL SELECT 'OBSERVES', COUNT(*) FROM observes
    UNION ALL SELECT 'PERSON', COUNT(*) FROM person
    UNION ALL SELECT 'PERSON_PHONE', COUNT(*) FROM person_phone
    UNION ALL SELECT 'PLAYER', COUNT(*) FROM player
    UNION ALL SELECT 'PLAYER_ACHIEVEMENT', COUNT(*) FROM player_achievement
    UNION ALL SELECT 'PLAYER_EDUCATION', COUNT(*) FROM player_education
    UNION ALL SELECT 'PLAYER_FITNESS', COUNT(*) FROM player_fitness
    UNION ALL SELECT 'PLAYS_FOR', COUNT(*) FROM plays_for
    UNION ALL SELECT 'RULEBOOK', COUNT(*) FROM rulebook
    UNION ALL SELECT 'SOURCE_OF', COUNT(*) FROM source_of
    UNION ALL SELECT 'TEAM', COUNT(*) FROM team
    UNION ALL SELECT 'TOURNAMENT', COUNT(*) FROM tournament
    UNION ALL SELECT 'TOURNAMENT_SPONSOR', COUNT(*) FROM tournament_sponsor
    UNION ALL SELECT 'USER_ACCOUNT', COUNT(*) FROM user_account
    UNION ALL SELECT 'VIOLATES', COUNT(*) FROM violates
)
ORDER BY table_name;

PROMPT === TOTAL SEED ROWS ===
SELECT
    (SELECT COUNT(*) FROM admin) +
    (SELECT COUNT(*) FROM audit_log) +
    (SELECT COUNT(*) FROM batting_performance) +
    (SELECT COUNT(*) FROM batting_summary) +
    (SELECT COUNT(*) FROM bowling_performance) +
    (SELECT COUNT(*) FROM bowling_summary) +
    (SELECT COUNT(*) FROM career_record) +
    (SELECT COUNT(*) FROM case_record) +
    (SELECT COUNT(*) FROM complaint) +
    (SELECT COUNT(*) FROM evidence) +
    (SELECT COUNT(*) FROM fielding_performance) +
    (SELECT COUNT(*) FROM fielding_summary) +
    (SELECT COUNT(*) FROM includes) +
    (SELECT COUNT(*) FROM investigates) +
    (SELECT COUNT(*) FROM involves_in) +
    (SELECT COUNT(*) FROM match) +
    (SELECT COUNT(*) FROM mentors) +
    (SELECT COUNT(*) FROM observes) +
    (SELECT COUNT(*) FROM person) +
    (SELECT COUNT(*) FROM person_phone) +
    (SELECT COUNT(*) FROM player) +
    (SELECT COUNT(*) FROM player_achievement) +
    (SELECT COUNT(*) FROM player_education) +
    (SELECT COUNT(*) FROM player_fitness) +
    (SELECT COUNT(*) FROM plays_for) +
    (SELECT COUNT(*) FROM rulebook) +
    (SELECT COUNT(*) FROM source_of) +
    (SELECT COUNT(*) FROM team) +
    (SELECT COUNT(*) FROM tournament) +
    (SELECT COUNT(*) FROM tournament_sponsor) +
    (SELECT COUNT(*) FROM user_account) +
    (SELECT COUNT(*) FROM violates) AS total_seed_rows
FROM dual;

PROMPT === SEQUENCES ===
SELECT sequence_name, min_value, max_value, increment_by, cycle_flag
FROM user_sequences
ORDER BY sequence_name;

PROMPT === OBJECT TYPES ===
SELECT type_name, typecode, attributes, methods
FROM user_types
ORDER BY type_name;

PROMPT === INDEXES ===
SELECT index_name, table_name, uniqueness, status
FROM user_indexes
ORDER BY table_name, index_name;

PROMPT === EXPLICIT INDEX COUNT ===
SELECT COUNT(*) AS actual_index_count,
       15 AS expected_index_count,
       CASE WHEN COUNT(*) = 15 THEN 'PASS' ELSE 'REVIEW' END AS verification
FROM user_indexes
WHERE index_name IN (
    'IX_MATCH_TOURNAMENT',
    'IX_MATCH_WINNER_TEAM',
    'IX_PLAYS_FOR_TEAM',
    'IX_CAREER_RECORD_PERSON',
    'IX_CAREER_RECORD_TEAM',
    'IX_PLAYER_FITNESS_PERSON_DATE',
    'IX_BATTING_PERFORMANCE_MATCH',
    'IX_BOWLING_PERFORMANCE_MATCH',
    'IX_FIELDING_PERFORMANCE_MATCH',
    'IX_CASE_RECORD_STATUS',
    'IX_INVOLVES_IN_CASE',
    'IX_INVESTIGATES_ADMIN',
    'IX_SOURCE_OF_COMPLAINT',
    'IX_VIOLATES_RULE',
    'IX_AUDIT_ENTITY_RECORD'
);

PROMPT === TRIGGERS ===
SELECT trigger_name, table_name, triggering_event, status
FROM user_triggers
ORDER BY trigger_name;
