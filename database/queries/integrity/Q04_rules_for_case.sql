-- Q04: All allegedly violated rules for one case.
-- V003 bind: :case_id = 1

SELECT
    r.rule_id,
    r.category,
    r.clause_no
FROM violates v
JOIN rulebook r
    ON r.rule_id = v.rule_id
WHERE v.case_id = :case_id
  AND v.is_deleted = 0
  AND r.is_deleted = 0
ORDER BY r.category, r.clause_no;
