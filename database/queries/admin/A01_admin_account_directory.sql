-- A01: Administrator directory with application-account status.
-- Core topics: specialization join and LEFT JOIN.

SELECT a.person_id AS admin_id,
       p.first_name || ' ' || p.last_name AS admin_name,
       a.designation,
       a.department,
       a.email,
       a.joining_date,
       ua.username,
       NVL(ua.account_status, 'NO ACCOUNT') AS account_status,
       ua.last_login
FROM admin a
JOIN person p ON p.person_id = a.person_id
LEFT JOIN user_account ua
       ON ua.person_id = a.person_id
      AND ua.is_deleted = 0
WHERE a.is_deleted = 0 AND p.is_deleted = 0
ORDER BY a.department, a.designation, admin_name;
