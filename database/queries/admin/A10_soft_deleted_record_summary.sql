-- A10: Administrative summary of soft-deleted records by entity.
-- Core topics: UNION ALL and soft-delete auditing.

SELECT 'PERSON' AS entity_name, COUNT(*) AS deleted_count FROM person WHERE is_deleted = 1
UNION ALL
SELECT 'PLAYER', COUNT(*) FROM player WHERE is_deleted = 1
UNION ALL
SELECT 'ADMIN', COUNT(*) FROM admin WHERE is_deleted = 1
UNION ALL
SELECT 'TEAM', COUNT(*) FROM team WHERE is_deleted = 1
UNION ALL
SELECT 'TOURNAMENT', COUNT(*) FROM tournament WHERE is_deleted = 1
UNION ALL
SELECT 'MATCH', COUNT(*) FROM match WHERE is_deleted = 1
UNION ALL
SELECT 'TOURNAMENT SPONSOR', COUNT(*) FROM tournament_sponsor WHERE is_deleted = 1
UNION ALL
SELECT 'PLAYER ACHIEVEMENT', COUNT(*) FROM player_achievement WHERE is_deleted = 1
UNION ALL
SELECT 'PERSON PHONE', COUNT(*) FROM person_phone WHERE is_deleted = 1
UNION ALL
SELECT 'USER ACCOUNT', COUNT(*) FROM user_account WHERE is_deleted = 1
ORDER BY 1;
