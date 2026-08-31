-- A06: Locked/inactive accounts and accounts that have never logged in.
-- Core topics: LEFT JOIN, OR filtering, and CASE.

SELECT p.person_id,
       p.first_name || ' ' || p.last_name AS person_name,
       ua.username,
       ua.account_status,
       ua.created_date,
       ua.last_login,
       CASE
           WHEN ua.account_status <> 'ACTIVE' THEN 'ACCOUNT NOT ACTIVE'
           WHEN ua.last_login IS NULL THEN 'NEVER LOGGED IN'
       END AS attention_reason
FROM user_account ua
JOIN person p ON p.person_id = ua.person_id
WHERE (ua.account_status <> 'ACTIVE' OR ua.last_login IS NULL)
  AND ua.is_deleted = 0
  AND p.is_deleted = 0
ORDER BY attention_reason, person_name;
