-- Q11: Complaint registry ordered by newest received date.

SELECT c.complaint_id,
       c.source_type,
       c.date_received,
       c.misconduct_type,
       c.description
FROM complaint c
WHERE c.is_deleted = 0
ORDER BY c.date_received DESC, c.complaint_id DESC;
