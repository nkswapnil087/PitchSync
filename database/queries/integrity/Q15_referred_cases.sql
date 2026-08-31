-- Q15: Active cases referred to an external authority.

SELECT c.case_id,
       c.status,
       c.date_opened,
       c.referral_status,
       c.referred_to_authority
FROM case_record c
WHERE c.referral_status = 'REFERRED'
  AND c.is_deleted = 0
ORDER BY c.date_opened DESC, c.case_id DESC;
