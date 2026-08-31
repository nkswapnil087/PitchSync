-- Show rules that have appeared in at least two cases.
SELECT
    r.rule_id,
    r.category,
    r.clause_no,
    COUNT(v.case_id) AS case_count
FROM rulebook r
JOIN violates v
    ON v.rule_id = r.rule_id
WHERE r.is_deleted = 0
  AND v.is_deleted = 0
GROUP BY
    r.rule_id,
    r.category,
    r.clause_no
HAVING COUNT(v.case_id) >= 2
ORDER BY case_count DESC;
