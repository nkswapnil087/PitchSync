-- A08: Match-observation workload and coverage by administrator.
-- Core topics: LEFT JOIN, COUNT DISTINCT, aggregate dates.

SELECT a.person_id AS admin_id,
       p.first_name || ' ' || p.last_name AS admin_name,
       a.designation,
       COUNT(o.match_id) AS observations_recorded,
       COUNT(DISTINCT o.match_id) AS matches_covered,
       COUNT(DISTINCT o.player_id) AS players_observed,
       MAX(o.observation_date) AS latest_observation
FROM admin a
JOIN person p ON p.person_id = a.person_id
LEFT JOIN observes o
       ON o.admin_id = a.person_id
      AND o.is_deleted = 0
WHERE a.is_deleted = 0 AND p.is_deleted = 0
GROUP BY a.person_id, p.first_name, p.last_name, a.designation
ORDER BY observations_recorded DESC, admin_name;
