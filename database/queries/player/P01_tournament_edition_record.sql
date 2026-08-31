-- P01: Complete player record in one tournament edition.
-- Core topics: CTE, UNION, aggregate functions, LEFT JOIN.
-- V003 demo binds: :player_id = 100003, :tournament_name = 'National T20 Championship', :season_year = 2026

WITH edition_matches AS (
    SELECT m.match_id
    FROM match m
    JOIN tournament t ON t.tournament_id = m.tournament_id
    WHERE t.tournament_name = :tournament_name
      AND t.season_year = :season_year
      AND t.is_deleted = 0
      AND m.is_deleted = 0
),
player_match_ids AS (
    SELECT bp.match_id
    FROM batting_performance bp
    JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id
    JOIN career_record cr ON cr.record_id = bs.record_id
    JOIN edition_matches em ON em.match_id = bp.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND bs.is_deleted = 0 AND bp.is_deleted = 0
    UNION
    SELECT bop.match_id
    FROM bowling_performance bop
    JOIN bowling_summary bos ON bos.bowl_summary_id = bop.bowl_summary_id
    JOIN career_record cr ON cr.record_id = bos.record_id
    JOIN edition_matches em ON em.match_id = bop.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND bos.is_deleted = 0 AND bop.is_deleted = 0
    UNION
    SELECT fp.match_id
    FROM fielding_performance fp
    JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id
    JOIN career_record cr ON cr.record_id = fs.record_id
    JOIN edition_matches em ON em.match_id = fp.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND fs.is_deleted = 0 AND fp.is_deleted = 0
),
batting AS (
    SELECT SUM(bp.runs_scored) AS runs,
           SUM(bp.balls_faced) AS balls,
           MAX(bp.runs_scored) AS highest_score
    FROM batting_performance bp
    JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id
    JOIN career_record cr ON cr.record_id = bs.record_id
    JOIN edition_matches em ON em.match_id = bp.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND bs.is_deleted = 0 AND bp.is_deleted = 0
),
bowling AS (
    SELECT SUM(bop.wickets_taken) AS wickets,
           SUM(bop.runs_conceded) AS runs_conceded,
           SUM(bop.balls_bowled) AS balls_bowled
    FROM bowling_performance bop
    JOIN bowling_summary bos ON bos.bowl_summary_id = bop.bowl_summary_id
    JOIN career_record cr ON cr.record_id = bos.record_id
    JOIN edition_matches em ON em.match_id = bop.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND bos.is_deleted = 0 AND bop.is_deleted = 0
),
fielding AS (
    SELECT SUM(fp.catches) AS catches,
           SUM(fp.stumpings) AS stumpings,
           SUM(fp.runs_out_direct) AS direct_run_outs
    FROM fielding_performance fp
    JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id
    JOIN career_record cr ON cr.record_id = fs.record_id
    JOIN edition_matches em ON em.match_id = fp.match_id
    WHERE cr.person_id = :player_id
      AND cr.is_deleted = 0 AND fs.is_deleted = 0 AND fp.is_deleted = 0
)
SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS player_name,
       :tournament_name AS tournament_name,
       :season_year AS season_year,
       (SELECT COUNT(*) FROM player_match_ids) AS matches_with_performance,
       NVL(b.runs, 0) AS runs,
       NVL(b.balls, 0) AS balls_faced,
       ROUND(NVL(b.runs * 100 / NULLIF(b.balls, 0), 0), 2) AS batting_strike_rate,
       NVL(b.highest_score, 0) AS highest_score,
       NVL(bo.wickets, 0) AS wickets,
       NVL(bo.runs_conceded, 0) AS runs_conceded,
       ROUND(NVL(bo.runs_conceded * 6 / NULLIF(bo.balls_bowled, 0), 0), 2) AS economy_rate,
       NVL(f.catches, 0) AS catches,
       NVL(f.stumpings, 0) AS stumpings,
       NVL(f.direct_run_outs, 0) AS direct_run_outs
FROM person p
CROSS JOIN batting b
CROSS JOIN bowling bo
CROSS JOIN fielding f
WHERE p.person_id = :player_id
  AND p.is_deleted = 0;
