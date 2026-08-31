-- P09: Current mentor-junior pairs with their teams.
-- Core topics: self-referencing relationship and repeated joins.

SELECT junior.person_id AS junior_id,
       junior.first_name || ' ' || junior.last_name AS junior_name,
       jt.team_name AS junior_team,
       mentor.person_id AS mentor_id,
       mentor.first_name || ' ' || mentor.last_name AS mentor_name,
       mt.team_name AS mentor_team,
       me.mentor_since
FROM mentors me
JOIN person junior ON junior.person_id = me.junior_id
JOIN person mentor ON mentor.person_id = me.mentor_id
LEFT JOIN plays_for jpf
       ON jpf.person_id = me.junior_id
      AND jpf.end_date IS NULL AND jpf.is_deleted = 0
LEFT JOIN team jt ON jt.team_id = jpf.team_id AND jt.is_deleted = 0
LEFT JOIN plays_for mpf
       ON mpf.person_id = me.mentor_id
      AND mpf.end_date IS NULL AND mpf.is_deleted = 0
LEFT JOIN team mt ON mt.team_id = mpf.team_id AND mt.is_deleted = 0
WHERE me.mentor_until IS NULL
  AND me.is_deleted = 0
  AND junior.is_deleted = 0
  AND mentor.is_deleted = 0
ORDER BY mentor_name, junior_name;
