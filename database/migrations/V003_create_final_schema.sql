SET DEFINE OFF;

--------------------------------------------------------------------------------
-- PITCHSYNC
-- V003 - REBUILD CORE SCHEMA
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 0. DROP V002 TABLES
--------------------------------------------------------------------------------

DROP TABLE audit_log CASCADE CONSTRAINTS PURGE;

DROP TABLE observes CASCADE CONSTRAINTS PURGE;

DROP TABLE evidence CASCADE CONSTRAINTS PURGE;
DROP TABLE source_of CASCADE CONSTRAINTS PURGE;
DROP TABLE violates CASCADE CONSTRAINTS PURGE;
DROP TABLE investigates CASCADE CONSTRAINTS PURGE;
DROP TABLE involves_in CASCADE CONSTRAINTS PURGE;
DROP TABLE case_record CASCADE CONSTRAINTS PURGE;
DROP TABLE complaint CASCADE CONSTRAINTS PURGE;
DROP TABLE rulebook CASCADE CONSTRAINTS PURGE;

DROP TABLE fielding_performance CASCADE CONSTRAINTS PURGE;
DROP TABLE bowling_performance CASCADE CONSTRAINTS PURGE;
DROP TABLE batting_performance CASCADE CONSTRAINTS PURGE;

DROP TABLE fielding_summary CASCADE CONSTRAINTS PURGE;
DROP TABLE bowling_summary CASCADE CONSTRAINTS PURGE;
DROP TABLE batting_summary CASCADE CONSTRAINTS PURGE;
DROP TABLE career_record CASCADE CONSTRAINTS PURGE;

DROP TABLE includes CASCADE CONSTRAINTS PURGE;
DROP TABLE match CASCADE CONSTRAINTS PURGE;
DROP TABLE tournament_sponsor CASCADE CONSTRAINTS PURGE;
DROP TABLE tournament CASCADE CONSTRAINTS PURGE;

DROP TABLE player_fitness CASCADE CONSTRAINTS PURGE;

DROP TABLE mentors CASCADE CONSTRAINTS PURGE;
DROP TABLE plays_for CASCADE CONSTRAINTS PURGE;
DROP TABLE team CASCADE CONSTRAINTS PURGE;

DROP TABLE user_account CASCADE CONSTRAINTS PURGE;

DROP TABLE player_education CASCADE CONSTRAINTS PURGE;
DROP TABLE player_achievement CASCADE CONSTRAINTS PURGE;
DROP TABLE person_phone CASCADE CONSTRAINTS PURGE;

DROP TABLE admin CASCADE CONSTRAINTS PURGE;
DROP TABLE player CASCADE CONSTRAINTS PURGE;
DROP TABLE person CASCADE CONSTRAINTS PURGE;



DROP SEQUENCE seq_player_person;
DROP SEQUENCE seq_admin_person;
DROP SEQUENCE seq_match;
DROP SEQUENCE seq_complaint;
DROP SEQUENCE seq_case_record;

DROP TYPE education_type;
DROP TYPE address_type;

--------------------------------------------------------------------------------
-- 1. ABSTRACT DATA TYPES
--------------------------------------------------------------------------------

CREATE TYPE address_type AS OBJECT (
    address_line       VARCHAR2(255),
    upazila_or_thana   VARCHAR2(100),
    district           VARCHAR2(100),
    division           VARCHAR2(100)
);
/

CREATE TYPE education_type AS OBJECT (
    degree_class        VARCHAR2(100),
    institute_or_board  VARCHAR2(150),
    result              VARCHAR2(50),
    subject             VARCHAR2(100)
);
/


--------------------------------------------------------------------------------
-- 2. USER-FACING ID SEQUENCES
--
-- PLAYER and ADMIN share PERSON.person_id as PK/FK.
-- Different non-overlapping ranges make the identity understandable.
--------------------------------------------------------------------------------

CREATE SEQUENCE seq_player_person
    START WITH 100001
    INCREMENT BY 1
    MAXVALUE 199999
    NOCYCLE;


CREATE SEQUENCE seq_admin_person
    START WITH 200001
    INCREMENT BY 1
    MAXVALUE 299999
    NOCYCLE;


CREATE SEQUENCE seq_match
    START WITH 1
    INCREMENT BY 1
    NOCYCLE;


CREATE SEQUENCE seq_complaint
    START WITH 1
    INCREMENT BY 1
    NOCYCLE;


CREATE SEQUENCE seq_case_record
    START WITH 1
    INCREMENT BY 1
    NOCYCLE;


--------------------------------------------------------------------------------
-- 3. PEOPLE / SPECIALIZATION
--
-- PERSON.person_id is supplied from:
--
--   seq_player_person for a PLAYER
--   seq_admin_person  for an ADMIN
--
-- The registration procedure/backend will handle this automatically.
--------------------------------------------------------------------------------

CREATE TABLE person (
    person_id          NUMBER(10),
    first_name         VARCHAR2(50) NOT NULL,
    last_name          VARCHAR2(50) NOT NULL,
    dob                DATE NOT NULL,

    present_address    address_type,
    permanent_address  address_type,

    is_deleted         NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_person
        PRIMARY KEY (person_id)
);


CREATE TABLE player (
    person_id          NUMBER(10),
    player_role        VARCHAR2(50) NOT NULL,
    gender             VARCHAR2(20) NOT NULL,
    family_background  VARCHAR2(100),

    is_deleted         NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_player
        PRIMARY KEY (person_id),

    CONSTRAINT fk_player_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id)
);


CREATE TABLE admin (
    person_id     NUMBER(10),
    designation   VARCHAR2(100) NOT NULL,
    department    VARCHAR2(100) NOT NULL,
    email         VARCHAR2(100) NOT NULL,
    joining_date  DATE NOT NULL,

    is_deleted    NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_admin
        PRIMARY KEY (person_id),

    CONSTRAINT fk_admin_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id),

    CONSTRAINT uq_admin_email
        UNIQUE (email)
);


--------------------------------------------------------------------------------
-- 4. MULTIVALUED PERSON / PLAYER ATTRIBUTES
--------------------------------------------------------------------------------

CREATE TABLE person_phone (
    person_id   NUMBER(10),
    phone       VARCHAR2(20),

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_person_phone
        PRIMARY KEY (person_id, phone),

    CONSTRAINT fk_person_phone_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id)
);


CREATE TABLE player_achievement (
    person_id    NUMBER(10),
    achievement  VARCHAR2(255),

    is_deleted   NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_player_achievement
        PRIMARY KEY (person_id, achievement),

    CONSTRAINT fk_player_achievement_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id)
);


CREATE TABLE player_education (
    person_id       NUMBER(10),
    education_no    NUMBER(3),
    education_info  education_type NOT NULL,

    is_deleted      NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_player_education
        PRIMARY KEY (person_id, education_no),

    CONSTRAINT fk_player_education_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id)
);


--------------------------------------------------------------------------------
-- 5. AUTHENTICATION / APPLICATION ACCOUNT
--
-- Internal technical PK -> Oracle IDENTITY.
--------------------------------------------------------------------------------

CREATE TABLE user_account (
    account_id      NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    person_id       NUMBER(10) NOT NULL,
    username        VARCHAR2(100) NOT NULL,
    password_hash   VARCHAR2(255) NOT NULL,
    account_status  VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_date    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    last_login      TIMESTAMP,

    is_deleted      NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_user_account
        PRIMARY KEY (account_id),

    CONSTRAINT fk_user_account_person
        FOREIGN KEY (person_id)
        REFERENCES person(person_id),

    CONSTRAINT uq_user_account_person
        UNIQUE (person_id),

    CONSTRAINT uq_user_account_username
        UNIQUE (username)
);


--------------------------------------------------------------------------------
-- 6. TEAM / PLAYER TEAM HISTORY / MENTORSHIP
--------------------------------------------------------------------------------

CREATE TABLE team (
    team_id          NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    team_name        VARCHAR2(100) NOT NULL,
    category         VARCHAR2(50) NOT NULL,
    franchise_owner  VARCHAR2(100),

    is_deleted       NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_team
        PRIMARY KEY (team_id)
);


CREATE TABLE plays_for (
    person_id   NUMBER(10),
    team_id     NUMBER(10),
    start_date  DATE,
    end_date    DATE,

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_plays_for
        PRIMARY KEY (person_id, team_id, start_date),

    CONSTRAINT fk_plays_for_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_plays_for_team
        FOREIGN KEY (team_id)
        REFERENCES team(team_id),

    CONSTRAINT ck_plays_for_dates
        CHECK (
            end_date IS NULL
            OR end_date >= start_date
        )
);


CREATE TABLE mentors (
    junior_id     NUMBER(10),
    mentor_id     NUMBER(10) NOT NULL,
    mentor_since  DATE,
    mentor_until  DATE,

    is_deleted    NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_mentors
        PRIMARY KEY (junior_id, mentor_since),

    CONSTRAINT fk_mentors_junior
        FOREIGN KEY (junior_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_mentors_mentor
        FOREIGN KEY (mentor_id)
        REFERENCES player(person_id),

    CONSTRAINT ck_mentors_distinct
        CHECK (junior_id <> mentor_id),

    CONSTRAINT ck_mentors_dates
        CHECK (
            mentor_until IS NULL
            OR mentor_until >= mentor_since
        )
);

--------------------------------------------------------------------------------
-- 7. PLAYER FITNESS / AVAILABILITY
--
-- Internal record -> Oracle IDENTITY.
--------------------------------------------------------------------------------

CREATE TABLE player_fitness (
    fitness_record_id     NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    person_id             NUMBER(10) NOT NULL,
    injury_status         VARCHAR2(30) NOT NULL,
    recovery_status       VARCHAR2(50),
    expected_return_date  DATE,
    fitness_clearance     CHAR(1) DEFAULT 'N' NOT NULL,
    training_available    CHAR(1) DEFAULT 'N' NOT NULL,
    match_available       CHAR(1) DEFAULT 'N' NOT NULL,
    recorded_date         DATE DEFAULT SYSDATE NOT NULL,
    updated_by            NUMBER(10) NOT NULL,

    is_deleted            NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_player_fitness
        PRIMARY KEY (fitness_record_id),

    CONSTRAINT fk_player_fitness_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_player_fitness_admin
        FOREIGN KEY (updated_by)
        REFERENCES admin(person_id),

    CONSTRAINT ck_fitness_return_date
        CHECK (
            expected_return_date IS NULL
            OR expected_return_date >= recorded_date
        )
);


--------------------------------------------------------------------------------
-- 8. TOURNAMENT / MATCH / PARTICIPATING TEAMS
--------------------------------------------------------------------------------

CREATE TABLE tournament (
    tournament_id          NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    tournament_name        VARCHAR2(100) NOT NULL,
    tournament_tier_level  VARCHAR2(20) NOT NULL,
    season_year            NUMBER(4),

    is_deleted             NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_tournament
        PRIMARY KEY (tournament_id),

    CONSTRAINT uq_tournament_name_season
        UNIQUE (tournament_name, season_year)
);


CREATE TABLE tournament_sponsor (
    tournament_id  NUMBER(10),
    sponsor        VARCHAR2(100),

    is_deleted     NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_tournament_sponsor
        PRIMARY KEY (tournament_id, sponsor),

    CONSTRAINT fk_tournament_sponsor_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournament(tournament_id)
);


-- MATCH is user-facing, so explicit sequence is used.

CREATE TABLE match (
    match_id         NUMBER(10) DEFAULT seq_match.NEXTVAL,
    tournament_id    NUMBER(10) NOT NULL,
    match_date       DATE NOT NULL,
    venue            VARCHAR2(100) NOT NULL,
    match_format     VARCHAR2(20) NOT NULL,
    match_status     VARCHAR2(20) DEFAULT 'SCHEDULED' NOT NULL,
    result           VARCHAR2(500),
    winner_team_id   NUMBER(10),

    is_deleted       NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_match
        PRIMARY KEY (match_id),

    CONSTRAINT fk_match_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournament(tournament_id),

    CONSTRAINT fk_match_winner_team
        FOREIGN KEY (winner_team_id)
        REFERENCES team(team_id)
);


CREATE TABLE includes (
    match_id    NUMBER(10),
    team_id     NUMBER(10),

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_includes
        PRIMARY KEY (match_id, team_id),

    CONSTRAINT fk_includes_match
        FOREIGN KEY (match_id)
        REFERENCES match(match_id),

    CONSTRAINT fk_includes_team
        FOREIGN KEY (team_id)
        REFERENCES team(team_id)
);


--------------------------------------------------------------------------------
-- 9. CAREER RECORD AND FORMAT SUMMARIES
--
-- These are internal database records -> Oracle IDENTITY.
--------------------------------------------------------------------------------

CREATE TABLE career_record (
    record_id       NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    person_id       NUMBER(10) NOT NULL,
    team_id         NUMBER(10) NOT NULL,
    tier_level      VARCHAR2(20) NOT NULL,
    location_type   VARCHAR2(20) NOT NULL,
    matches_played  NUMBER(10) DEFAULT 0 NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,

    is_deleted      NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_career_record
        PRIMARY KEY (record_id),

    CONSTRAINT fk_career_record_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_career_record_team
        FOREIGN KEY (team_id)
        REFERENCES team(team_id),

    CONSTRAINT ck_career_dates
        CHECK (
            end_date IS NULL
            OR end_date >= start_date
        )
);


CREATE TABLE batting_summary (
    bat_summary_id  NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    record_id       NUMBER(10) NOT NULL,
    total_runs      NUMBER(10) NOT NULL,
    batting_avg     NUMBER(7,2) NOT NULL,
    strike_rate     NUMBER(7,2) NOT NULL,
    highest_score   NUMBER(10) NOT NULL,
    format          VARCHAR2(20) NOT NULL,

    is_deleted      NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_batting_summary
        PRIMARY KEY (bat_summary_id),

    CONSTRAINT fk_batting_summary_record
        FOREIGN KEY (record_id)
        REFERENCES career_record(record_id),

    CONSTRAINT uq_batting_summary_record_format
        UNIQUE (record_id, format)
);


CREATE TABLE bowling_summary (
    bowl_summary_id       NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    record_id             NUMBER(10) NOT NULL,
    total_wickets         NUMBER(10) NOT NULL,
    bowling_avg           NUMBER(7,2) NOT NULL,
    best_bowling_figures  VARCHAR2(20) NOT NULL,
    economy_rate          NUMBER(7,2) NOT NULL,
    format                VARCHAR2(20) NOT NULL,

    is_deleted            NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_bowling_summary
        PRIMARY KEY (bowl_summary_id),

    CONSTRAINT fk_bowling_summary_record
        FOREIGN KEY (record_id)
        REFERENCES career_record(record_id),

    CONSTRAINT uq_bowling_summary_record_format
        UNIQUE (record_id, format)
);


CREATE TABLE fielding_summary (
    field_summary_id          NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    record_id                 NUMBER(10) NOT NULL,
    total_catches             NUMBER(10) NOT NULL,
    total_stumpings           NUMBER(10) NOT NULL,
    total_runouts             NUMBER(10) NOT NULL,
    most_dismissals_in_match  NUMBER(10) NOT NULL,
    format                    VARCHAR2(20) NOT NULL,

    is_deleted                NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_fielding_summary
        PRIMARY KEY (field_summary_id),

    CONSTRAINT fk_fielding_summary_record
        FOREIGN KEY (record_id)
        REFERENCES career_record(record_id),

    CONSTRAINT uq_fielding_summary_record_format
        UNIQUE (record_id, format)
);


--------------------------------------------------------------------------------
-- 10. MATCH PERFORMANCE
--
-- Internal database records -> Oracle IDENTITY.
--------------------------------------------------------------------------------

CREATE TABLE batting_performance (
    bat_stat_id      NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    bat_summary_id   NUMBER(10) NOT NULL,
    match_id         NUMBER(10) NOT NULL,
    runs_scored      NUMBER(10) NOT NULL,
    balls_faced      NUMBER(10) NOT NULL,
    strike_rate      NUMBER(7,2) NOT NULL,
    dismissal_type   VARCHAR2(50),

    is_deleted       NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_batting_performance
        PRIMARY KEY (bat_stat_id),

    CONSTRAINT fk_batting_performance_summary
        FOREIGN KEY (bat_summary_id)
        REFERENCES batting_summary(bat_summary_id),

    CONSTRAINT fk_batting_performance_match
        FOREIGN KEY (match_id)
        REFERENCES match(match_id),

    CONSTRAINT uq_batting_perf_match_summary
        UNIQUE (match_id, bat_summary_id)
);


CREATE TABLE bowling_performance (
    bowl_stat_id     NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    bowl_summary_id  NUMBER(10) NOT NULL,
    match_id         NUMBER(10) NOT NULL,
    wickets_taken    NUMBER(10) NOT NULL,
    balls_bowled     NUMBER(10) NOT NULL,
    runs_conceded    NUMBER(10) NOT NULL,
    economy_rate     NUMBER(7,2) NOT NULL,

    is_deleted       NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_bowling_performance
        PRIMARY KEY (bowl_stat_id),

    CONSTRAINT fk_bowling_performance_summary
        FOREIGN KEY (bowl_summary_id)
        REFERENCES bowling_summary(bowl_summary_id),

    CONSTRAINT fk_bowling_performance_match
        FOREIGN KEY (match_id)
        REFERENCES match(match_id),

    CONSTRAINT uq_bowling_perf_match_summary
        UNIQUE (match_id, bowl_summary_id)
);


CREATE TABLE fielding_performance (
    field_stat_id     NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    field_summary_id  NUMBER(10) NOT NULL,
    match_id          NUMBER(10) NOT NULL,
    catches           NUMBER(10) NOT NULL,
    stumpings         NUMBER(10) NOT NULL,
    runs_out_direct   NUMBER(10) NOT NULL,
    byes_conceded     NUMBER(10) NOT NULL,

    is_deleted        NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_fielding_performance
        PRIMARY KEY (field_stat_id),

    CONSTRAINT fk_fielding_performance_summary
        FOREIGN KEY (field_summary_id)
        REFERENCES fielding_summary(field_summary_id),

    CONSTRAINT fk_fielding_performance_match
        FOREIGN KEY (match_id)
        REFERENCES match(match_id),

    CONSTRAINT uq_fielding_perf_match_summary
        UNIQUE (match_id, field_summary_id)
);


--------------------------------------------------------------------------------
-- 11. INTEGRITY / DISCIPLINARY MANAGEMENT
--------------------------------------------------------------------------------

CREATE TABLE rulebook (
    rule_id      NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    clause_no    VARCHAR2(20) NOT NULL,
    category     VARCHAR2(50) NOT NULL,

    is_deleted   NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_rulebook
        PRIMARY KEY (rule_id),

    CONSTRAINT uq_rulebook_clause
        UNIQUE (category, clause_no)
);


-- Complaint ID is used by Integrity users -> explicit sequence.

CREATE TABLE complaint (
    complaint_id     NUMBER(10) DEFAULT seq_complaint.NEXTVAL,
    source_type      VARCHAR2(50) NOT NULL,
    date_received    DATE DEFAULT SYSDATE NOT NULL,
    description      VARCHAR2(2000) NOT NULL,
    misconduct_type  VARCHAR2(100),

    is_deleted       NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_complaint
        PRIMARY KEY (complaint_id)
);


-- Case ID is used throughout the Integrity workflow -> explicit sequence.

CREATE TABLE case_record (
    case_id                NUMBER(10) DEFAULT seq_case_record.NEXTVAL,
    status                 VARCHAR2(30) DEFAULT 'OPEN' NOT NULL,
    involvement_type       VARCHAR2(50),
    date_opened            DATE DEFAULT SYSDATE NOT NULL,
    referral_status        VARCHAR2(20) DEFAULT 'NOT_REFERRED' NOT NULL,
    referred_to_authority  VARCHAR2(200),

    is_deleted             NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_case_record
        PRIMARY KEY (case_id),

    CONSTRAINT ck_case_referral_consistency
        CHECK (
            (
                referral_status = 'NOT_REFERRED'
                AND referred_to_authority IS NULL
            )
            OR
            (
                referral_status = 'REFERRED'
                AND referred_to_authority IS NOT NULL
            )
        )
);


CREATE TABLE involves_in (
    person_id   NUMBER(10),
    case_id     NUMBER(10),

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_involves_in
        PRIMARY KEY (person_id, case_id),

    CONSTRAINT fk_involves_in_player
        FOREIGN KEY (person_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_involves_in_case
        FOREIGN KEY (case_id)
        REFERENCES case_record(case_id)
);


CREATE TABLE investigates (
    person_id   NUMBER(10),
    case_id     NUMBER(10),
    admin_id    NUMBER(10) NOT NULL,

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_investigates
        PRIMARY KEY (person_id, case_id),

    CONSTRAINT fk_investigates_involvement
        FOREIGN KEY (person_id, case_id)
        REFERENCES involves_in(person_id, case_id),

    CONSTRAINT fk_investigates_admin
        FOREIGN KEY (admin_id)
        REFERENCES admin(person_id)
);


CREATE TABLE violates (
    case_id     NUMBER(10),
    rule_id     NUMBER(10),

    is_deleted  NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_violates
        PRIMARY KEY (case_id, rule_id),

    CONSTRAINT fk_violates_case
        FOREIGN KEY (case_id)
        REFERENCES case_record(case_id),

    CONSTRAINT fk_violates_rule
        FOREIGN KEY (rule_id)
        REFERENCES rulebook(rule_id)
);


CREATE TABLE source_of (
    case_id       NUMBER(10),
    complaint_id  NUMBER(10),

    is_deleted    NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_source_of
        PRIMARY KEY (case_id, complaint_id),

    CONSTRAINT fk_source_of_case
        FOREIGN KEY (case_id)
        REFERENCES case_record(case_id),

    CONSTRAINT fk_source_of_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint(complaint_id)
);


CREATE TABLE evidence (
    case_id         NUMBER(10),
    evidence_no     NUMBER(10),
    description     VARCHAR2(2000) NOT NULL,
    collected_date  DATE NOT NULL,

    is_deleted      NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_evidence
        PRIMARY KEY (case_id, evidence_no),

    CONSTRAINT fk_evidence_case
        FOREIGN KEY (case_id)
        REFERENCES case_record(case_id)
);


--------------------------------------------------------------------------------
-- 12. ADMIN OBSERVATION OF PLAYER IN A MATCH
--------------------------------------------------------------------------------

CREATE TABLE observes (
    admin_id          NUMBER(10),
    player_id         NUMBER(10),
    match_id          NUMBER(10),
    observation_date  DATE,
    remarks           VARCHAR2(2000),

    is_deleted        NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_observes
        PRIMARY KEY (
            admin_id,
            player_id,
            match_id,
            observation_date
        ),

    CONSTRAINT fk_observes_admin
        FOREIGN KEY (admin_id)
        REFERENCES admin(person_id),

    CONSTRAINT fk_observes_player
        FOREIGN KEY (player_id)
        REFERENCES player(person_id),

    CONSTRAINT fk_observes_match
        FOREIGN KEY (match_id)
        REFERENCES match(match_id)
);


--------------------------------------------------------------------------------
-- 13. AUDIT SUPPORT
--
-- Internal technical record -> Oracle IDENTITY.
--------------------------------------------------------------------------------

CREATE TABLE audit_log (
    audit_id           NUMBER(10) GENERATED ALWAYS AS IDENTITY,
    actor_person_id    NUMBER(10),
    entity_name        VARCHAR2(50) NOT NULL,
    record_identifier  VARCHAR2(200) NOT NULL,
    operation          VARCHAR2(10) NOT NULL,
    action_timestamp   TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    old_values         CLOB,
    new_values         CLOB,

    is_deleted         NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_audit_log
        PRIMARY KEY (audit_id),

    CONSTRAINT fk_audit_log_actor
        FOREIGN KEY (actor_person_id)
        REFERENCES person(person_id)
);


--------------------------------------------------------------------------------
-- END OF V003 CORE SCHEMA
--------------------------------------------------------------------------------