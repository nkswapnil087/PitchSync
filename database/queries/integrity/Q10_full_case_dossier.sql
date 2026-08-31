-- Q10: One-case dossier summary with related-record counts.
-- V003 bind: :case_id = 1

SELECT c.case_id,
       c.status,
       c.involvement_type,
       c.date_opened,
       c.referral_status,
       c.referred_to_authority,
       (SELECT COUNT(*)
        FROM source_of s
        WHERE s.case_id = c.case_id AND s.is_deleted = 0) AS complaint_count,
       (SELECT COUNT(*)
        FROM involves_in ii
        WHERE ii.case_id = c.case_id AND ii.is_deleted = 0) AS involved_player_count,
       (SELECT COUNT(*)
        FROM investigates i
        WHERE i.case_id = c.case_id AND i.is_deleted = 0) AS investigator_assignment_count,
       (SELECT COUNT(*)
        FROM violates v
        WHERE v.case_id = c.case_id AND v.is_deleted = 0) AS rule_count,
       (SELECT COUNT(*)
        FROM evidence e
        WHERE e.case_id = c.case_id AND e.is_deleted = 0) AS evidence_count
FROM case_record c
WHERE c.case_id = :case_id
  AND c.is_deleted = 0;
