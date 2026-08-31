-- T06: Active sponsor coverage for every tournament edition.
-- Core topics: LEFT JOIN, COUNT, and LISTAGG.

SELECT t.tournament_id,
       t.tournament_name,
       t.season_year,
       COUNT(ts.sponsor) AS active_sponsor_count,
       NVL(LISTAGG(ts.sponsor, ', ') WITHIN GROUP (ORDER BY ts.sponsor),
           'No active sponsor') AS active_sponsors
FROM tournament t
LEFT JOIN tournament_sponsor ts
       ON ts.tournament_id = t.tournament_id
      AND ts.is_deleted = 0
WHERE t.is_deleted = 0
GROUP BY t.tournament_id, t.tournament_name, t.season_year
ORDER BY t.season_year DESC, t.tournament_name;
