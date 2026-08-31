-- Q13: Cases involving one player.
-- V003 bind: :player_id = 100001
SELECT
    c.case_id,
    c.status,
    c.involvement_type,
    c.date_opened,
    c.referral_status
FROM involves_in ii
JOIN case_record c
    ON c.case_id = ii.case_id
WHERE ii.person_id = :player_id
  AND ii.is_deleted = 0
  AND c.is_deleted = 0
ORDER BY c.date_opened DESC;
