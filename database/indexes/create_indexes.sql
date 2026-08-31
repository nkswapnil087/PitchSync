/*
  PitchSync - Explicit Performance / Lookup Indexes
  Target DBMS: Oracle Database 19c

  Run AFTER V003_create_final_schema.sql.

  Note:
  - PRIMARY KEY and UNIQUE constraints already create supporting indexes
    automatically in Oracle.
  - This file contains only additional indexes added for lookup/reporting
    performance and foreign-key access patterns.
*/

CREATE INDEX ix_match_tournament
    ON match(tournament_id);

CREATE INDEX ix_match_winner_team
    ON match(winner_team_id);

CREATE INDEX ix_plays_for_team
    ON plays_for(team_id);

CREATE INDEX ix_career_record_person
    ON career_record(person_id);

CREATE INDEX ix_career_record_team
    ON career_record(team_id);

CREATE INDEX ix_player_fitness_person_date
    ON player_fitness(person_id, recorded_date);

CREATE INDEX ix_batting_performance_match
    ON batting_performance(match_id);

CREATE INDEX ix_bowling_performance_match
    ON bowling_performance(match_id);

CREATE INDEX ix_fielding_performance_match
    ON fielding_performance(match_id);

CREATE INDEX ix_case_record_status
    ON case_record(status);

CREATE INDEX ix_involves_in_case
    ON involves_in(case_id);

CREATE INDEX ix_investigates_admin
    ON investigates(admin_id);

CREATE INDEX ix_source_of_complaint
    ON source_of(complaint_id);

CREATE INDEX ix_violates_rule
    ON violates(rule_id);

CREATE INDEX ix_audit_entity_record
    ON audit_log(entity_name, record_identifier);
