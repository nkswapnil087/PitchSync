-- A05: One-row-per-entity administrative count dashboard.
-- Core topics: UNION ALL and consistent projections.

SELECT 'ACTIVE PLAYERS' AS metric, COUNT(*) AS record_count
FROM player WHERE is_deleted = 0
UNION ALL
SELECT 'ACTIVE ADMINS', COUNT(*) FROM admin WHERE is_deleted = 0
UNION ALL
SELECT 'ACTIVE TEAMS', COUNT(*) FROM team WHERE is_deleted = 0
UNION ALL
SELECT 'TOURNAMENT EDITIONS', COUNT(*) FROM tournament WHERE is_deleted = 0
UNION ALL
SELECT 'COMPLETED MATCHES', COUNT(*) FROM match
WHERE match_status = 'COMPLETED' AND is_deleted = 0
UNION ALL
SELECT 'SCHEDULED MATCHES', COUNT(*) FROM match
WHERE match_status = 'SCHEDULED' AND is_deleted = 0
UNION ALL
SELECT 'OPEN INTEGRITY CASES', COUNT(*) FROM case_record
WHERE status IN ('OPEN', 'UNDER_INVESTIGATION', 'REFERRED') AND is_deleted = 0
ORDER BY 1;
