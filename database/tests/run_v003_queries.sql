SET PAGESIZE 200
SET LINESIZE 240
SET FEEDBACK ON
SET VERIFY OFF
SET DEFINE OFF
WHENEVER SQLERROR CONTINUE

ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';

VARIABLE admin_id NUMBER
VARIABLE case_id NUMBER
VARIABLE complaint_id NUMBER
VARIABLE player_id NUMBER
VARIABLE team_id NUMBER
VARIABLE tournament_id NUMBER
VARIABLE season_year NUMBER
VARIABLE minimum_runs NUMBER
VARIABLE minimum_wickets NUMBER
VARIABLE minimum_batting_average NUMBER
VARIABLE maximum_bowling_average NUMBER
VARIABLE from_date VARCHAR2(10)
VARIABLE date_from VARCHAR2(10)
VARIABLE date_to VARCHAR2(10)
VARIABLE tournament_name VARCHAR2(100)
VARIABLE match_format VARCHAR2(20)
VARIABLE location_type VARCHAR2(20)

BEGIN
    :admin_id := 200005;
    :case_id := 1;
    :complaint_id := 1;
    :player_id := 100003;
    :team_id := 1;
    :tournament_id := 1;
    :season_year := 2026;
    :minimum_runs := 25;
    :minimum_wickets := 1;
    :minimum_batting_average := 32;
    :maximum_bowling_average := 24;
    :from_date := '2026-09-01';
    :date_from := '2026-01-01';
    :date_to := '2026-12-31';
    :tournament_name := 'National T20 Championship';
    :match_format := 'T20';
    :location_type := 'Domestic';
END;
/

PROMPT === A01_admin_account_directory.sql ===
@@../queries/admin/A01_admin_account_directory.sql
PROMPT === A02_latest_player_availability.sql ===
@@../queries/admin/A02_latest_player_availability.sql
PROMPT === A03_players_without_fitness_record.sql ===
@@../queries/admin/A03_players_without_fitness_record.sql
PROMPT === A04_upcoming_match_availability.sql ===
@@../queries/admin/A04_upcoming_match_availability.sql
PROMPT === A05_system_record_counts.sql ===
@@../queries/admin/A05_system_record_counts.sql
PROMPT === A06_account_health_report.sql ===
@@../queries/admin/A06_account_health_report.sql
PROMPT === A07_audit_activity_report.sql ===
@@../queries/admin/A07_audit_activity_report.sql
PROMPT === A08_observation_workload.sql ===
@@../queries/admin/A08_observation_workload.sql
PROMPT === A09_performers_without_observation.sql ===
@@../queries/admin/A09_performers_without_observation.sql
PROMPT === A10_soft_deleted_record_summary.sql ===
@@../queries/admin/A10_soft_deleted_record_summary.sql

PROMPT === P01_tournament_edition_record.sql ===
@@../queries/player/P01_tournament_edition_record.sql
PROMPT === P02_format_location_career_record.sql ===
@@../queries/player/P02_format_location_career_record.sql
PROMPT === P03_match_by_match_tournament_scorecard.sql ===
@@../queries/player/P03_match_by_match_tournament_scorecard.sql
PROMPT === P04_above_team_average_batters.sql ===
@@../queries/player/P04_above_team_average_batters.sql
PROMPT === P05_selection_shortlist.sql ===
@@../queries/player/P05_selection_shortlist.sql
PROMPT === P06_current_team_roster.sql ===
@@../queries/player/P06_current_team_roster.sql
PROMPT === P07_incomplete_career_summaries.sql ===
@@../queries/player/P07_incomplete_career_summaries.sql
PROMPT === P08_personal_best_batting_by_tournament.sql ===
@@../queries/player/P08_personal_best_batting_by_tournament.sql
PROMPT === P09_current_mentorship_pairs.sql ===
@@../queries/player/P09_current_mentorship_pairs.sql

PROMPT === T01_edition_fixture_and_results.sql ===
@@../queries/tournament/T01_edition_fixture_and_results.sql
PROMPT === T02_team_results_table.sql ===
@@../queries/tournament/T02_team_results_table.sql
PROMPT === T03_leading_run_scorers.sql ===
@@../queries/tournament/T03_leading_run_scorers.sql
PROMPT === T04_leading_wicket_takers.sql ===
@@../queries/tournament/T04_leading_wicket_takers.sql
PROMPT === T05_venue_utilization.sql ===
@@../queries/tournament/T05_venue_utilization.sql
PROMPT === T06_sponsor_coverage.sql ===
@@../queries/tournament/T06_sponsor_coverage.sql
PROMPT === T07_cross_edition_summary.sql ===
@@../queries/tournament/T07_cross_edition_summary.sql
PROMPT === T08_completed_matches_missing_statistics.sql ===
@@../queries/tournament/T08_completed_matches_missing_statistics.sql
PROMPT === T09_teams_in_every_match.sql ===
@@../queries/tournament/T09_teams_in_every_match.sql

PROMPT === Q01_unresolved_cases.sql ===
@@../queries/integrity/Q01_unresolved_cases.sql
PROMPT === Q02_cases_by_investigator.sql ===
@@../queries/integrity/Q02_cases_by_investigator.sql
PROMPT === Q03_players_in_case.sql ===
@@../queries/integrity/Q03_players_in_case.sql
PROMPT === Q04_rules_for_case.sql ===
@@../queries/integrity/Q04_rules_for_case.sql
PROMPT === Q05_evidence_for_case.sql ===
@@../queries/integrity/Q05_evidence_for_case.sql
PROMPT === Q06_unresolved_cases_without_evidence.sql ===
@@../queries/integrity/Q06_unresolved_cases_without_evidence.sql
PROMPT === Q07_complaints_without_cases.sql ===
@@../queries/integrity/Q07_complaints_without_cases.sql
PROMPT === Q08_frequently_violated_rules.sql ===
@@../queries/integrity/Q08_frequently_violated_rules.sql
PROMPT === Q09_investigator_workload.sql ===
@@../queries/integrity/Q09_investigator_workload.sql
PROMPT === Q10_full_case_dossier.sql ===
@@../queries/integrity/Q10_full_case_dossier.sql
PROMPT === Q11_list_complaints.sql ===
@@../queries/integrity/Q11_list_complaints.sql
PROMPT === Q12_complaint_details_with_case.sql ===
@@../queries/integrity/Q12_complaint_details_with_case.sql
PROMPT === Q13_cases_by_player.sql ===
@@../queries/integrity/Q13_cases_by_player.sql
PROMPT === Q14_involvements_without_investigator.sql ===
@@../queries/integrity/Q14_involvements_without_investigator.sql
PROMPT === Q15_referred_cases.sql ===
@@../queries/integrity/Q15_referred_cases.sql
