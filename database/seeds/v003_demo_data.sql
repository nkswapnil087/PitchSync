SET DEFINE OFF;

--------------------------------------------------------------------------------
-- PITCHSYNC
-- V003 - DEMO DATA
--
-- Run this ONCE after the V003 core schema has been created on a clean schema.
-- The data is intentionally varied so joins, group functions, subqueries,
-- views, procedures/functions, cursors, triggers, and soft-delete behavior
-- can be demonstrated later.
--
-- NOTE ABOUT USER_ACCOUNT:
-- password_hash values below are demo placeholders only. Replace them with
-- hashes produced by the application's real password-hashing mechanism before
-- using these accounts for authentication.
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 1. PEOPLE / PLAYER SPECIALIZATION
--
-- Player IDs are generated from seq_player_person, starting at 100001.
-- Admin IDs are generated later from seq_admin_person, starting at 200001.
--------------------------------------------------------------------------------

-- 100001
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Arif', 'Hossain', DATE '1997-02-14',
    address_type('House 18, Road 7', 'Dhanmondi', 'Dhaka', 'Dhaka'),
    address_type('Village South Para', 'Debidwar', 'Cumilla', 'Chattogram')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Batter', 'MALE', 'Sports-oriented family');

-- 100002
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Rafiul', 'Karim', DATE '1996-08-20',
    address_type('Block C, Road 5', 'Mirpur', 'Dhaka', 'Dhaka'),
    address_type('College Road', 'Begumganj', 'Noakhali', 'Chattogram')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Bowler', 'MALE', 'General family');

-- 100003
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Nabil', 'Ahmed', DATE '1995-03-15',
    address_type('Shahjalal Uposhohor', 'Sylhet Sadar', 'Sylhet', 'Sylhet'),
    address_type('Ambarkhana', 'Sylhet Sadar', 'Sylhet', 'Sylhet')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'All-rounder', 'MALE', 'Cricket-oriented family');

-- 100004
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Farzana', 'Akter', DATE '1998-11-04',
    address_type('Sector 10', 'Uttara', 'Dhaka', 'Dhaka'),
    address_type('Station Road', 'Feni Sadar', 'Feni', 'Chattogram')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Wicketkeeper-batter', 'FEMALE', 'Sports-oriented family');

-- 100005
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Tanvir', 'Hasan', DATE '1999-01-11',
    address_type('Sonadanga Residential Area', 'Khulna Sadar', 'Khulna', 'Khulna'),
    address_type('Rail Road', 'Jashore Sadar', 'Jashore', 'Khulna')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Batter', 'MALE', 'General family');

-- 100006
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Mehedi', 'Rahman', DATE '1997-09-11',
    address_type('Kazla', 'Boalia', 'Rajshahi', 'Rajshahi'),
    address_type('Court Station', 'Paba', 'Rajshahi', 'Rajshahi')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'All-rounder', 'MALE', 'Sports family');

-- 100007
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Nusrat', 'Sultana', DATE '2000-06-30',
    address_type('Modern Mor', 'Rangpur Sadar', 'Rangpur', 'Rangpur'),
    address_type('Jahaj Company Mor', 'Rangpur Sadar', 'Rangpur', 'Rangpur')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Batter', 'FEMALE', 'General family');

-- 100008
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_player_person.NEXTVAL,
    'Sajid', 'Mahmud', DATE '2001-01-17',
    address_type('Bashundhara R/A', 'Badda', 'Dhaka', 'Dhaka'),
    address_type('Sadar Road', 'Barishal Sadar', 'Barishal', 'Barishal')
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (seq_player_person.CURRVAL, 'Bowler', 'MALE', 'General family');


--------------------------------------------------------------------------------
-- 2. ADMIN PEOPLE / ADMIN SPECIALIZATION
--
-- Exact designation wording follows the application role names.
--------------------------------------------------------------------------------

-- 200001
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Farhan', 'Kabir', DATE '1984-06-10',
    address_type('Banani DOHS', 'Banani', 'Dhaka', 'Dhaka'),
    address_type('Banani DOHS', 'Banani', 'Dhaka', 'Dhaka')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Super Administrator',
    'System Administration',
    'farhan.kabir@pitchsync.demo',
    DATE '2018-01-10'
);

-- 200002
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Imran', 'Hossain', DATE '1986-01-18',
    address_type('Eskaton', 'Ramna', 'Dhaka', 'Dhaka'),
    address_type('Natun Bazar', 'Barishal Sadar', 'Barishal', 'Barishal')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Cricket Board Administrator',
    'Board Operations',
    'imran.hossain@pitchsync.demo',
    DATE '2019-07-01'
);

-- 200003
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Samira', 'Ahmed', DATE '1987-04-25',
    address_type('Mohammadpur', 'Mohammadpur', 'Dhaka', 'Dhaka'),
    address_type('Kandirpar', 'Cumilla Sadar', 'Cumilla', 'Chattogram')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Team Performance Manager',
    'Team Performance',
    'samira.ahmed@pitchsync.demo',
    DATE '2020-02-01'
);

-- 200004
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Mahin', 'Chowdhury', DATE '1988-12-07',
    address_type('Pallabi', 'Mirpur', 'Dhaka', 'Dhaka'),
    address_type('Agrabad', 'Double Mooring', 'Chattogram', 'Chattogram')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Match Official',
    'Match Operations',
    'mahin.chowdhury@pitchsync.demo',
    DATE '2021-05-12'
);

-- 200005
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Nusrat', 'Jahan', DATE '1988-09-22',
    address_type('Green Road', 'Kalabagan', 'Dhaka', 'Dhaka'),
    address_type('Shaheb Bazar', 'Boalia', 'Rajshahi', 'Rajshahi')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Integrity & Compliance Officer',
    'Integrity & Compliance',
    'nusrat.jahan@pitchsync.demo',
    DATE '2021-03-15'
);

-- 200006
INSERT INTO person (
    person_id, first_name, last_name, dob,
    present_address, permanent_address
) VALUES (
    seq_admin_person.NEXTVAL,
    'Rezaul', 'Islam', DATE '1985-10-03',
    address_type('Shantinagar', 'Paltan', 'Dhaka', 'Dhaka'),
    address_type('Zindabazar', 'Sylhet Sadar', 'Sylhet', 'Sylhet')
);

INSERT INTO admin (
    person_id, designation, department, email, joining_date
) VALUES (
    seq_admin_person.CURRVAL,
    'Integrity & Compliance Officer',
    'Integrity & Compliance',
    'rezaul.islam@pitchsync.demo',
    DATE '2022-08-01'
);


--------------------------------------------------------------------------------
-- 3. MULTIVALUED PERSON / PLAYER DATA
--------------------------------------------------------------------------------

INSERT INTO person_phone (person_id, phone)
VALUES (100001, '+8801711000001');

-- Intentionally soft-deleted old number for soft-delete demonstrations.
INSERT INTO person_phone (person_id, phone, is_deleted)
VALUES (100001, '+8801811000001', 1);

INSERT INTO person_phone (person_id, phone)
VALUES (100002, '+8801711000002');

INSERT INTO person_phone (person_id, phone)
VALUES (100003, '+8801711000003');

INSERT INTO person_phone (person_id, phone)
VALUES (100004, '+8801711000004');

INSERT INTO person_phone (person_id, phone)
VALUES (100005, '+8801711000005');

INSERT INTO person_phone (person_id, phone)
VALUES (100006, '+8801711000006');

INSERT INTO person_phone (person_id, phone)
VALUES (100007, '+8801711000007');

INSERT INTO person_phone (person_id, phone)
VALUES (100008, '+8801711000008');

INSERT INTO person_phone (person_id, phone)
VALUES (200001, '+8801912000001');

INSERT INTO person_phone (person_id, phone)
VALUES (200003, '+8801912000003');

INSERT INTO person_phone (person_id, phone)
VALUES (200005, '+8801912000005');


INSERT INTO player_achievement (person_id, achievement)
VALUES (100001, 'Best Batter - National T20 2025');

INSERT INTO player_achievement (person_id, achievement)
VALUES (100003, 'Player of the Tournament - Premier Cup 2025');

INSERT INTO player_achievement (person_id, achievement)
VALUES (100004, 'Best Wicketkeeper - Women''s Elite League 2025');

INSERT INTO player_achievement (person_id, achievement)
VALUES (100006, 'Emerging All-rounder Award 2024');

INSERT INTO player_achievement (person_id, achievement)
VALUES (100007, 'Top Run Scorer - Regional League 2025');

-- Intentionally soft-deleted historical entry.
INSERT INTO player_achievement (person_id, achievement, is_deleted)
VALUES (100005, 'Regional Youth Camp Selection 2022', 1);


INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100001, 1,
    education_type('Bachelor', 'National University', 'Completed', 'Business Studies')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100002, 1,
    education_type('HSC', 'Dhaka College', 'GPA 4.80', 'Science')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100003, 1,
    education_type('Bachelor', 'Sylhet International University', 'Completed', 'Management')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100004, 1,
    education_type('Bachelor', 'Eden Mohila College', 'Ongoing', 'English')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100005, 1,
    education_type('HSC', 'Khulna Public College', 'GPA 4.65', 'Humanities')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100006, 1,
    education_type('Bachelor', 'Rajshahi College', 'Ongoing', 'Accounting')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100007, 1,
    education_type('HSC', 'Rangpur Government College', 'GPA 5.00', 'Science')
);

INSERT INTO player_education (person_id, education_no, education_info)
VALUES (
    100008, 1,
    education_type('HSC', 'Barishal Government College', 'GPA 4.75', 'Science')
);


--------------------------------------------------------------------------------
-- 4. USER ACCOUNTS
--------------------------------------------------------------------------------

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200001, 'super.admin', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200002, 'board.admin', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200003, 'performance.manager', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200004, 'match.official', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200005, 'integrity.nusrat', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (200006, 'integrity.rezaul', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (100001, 'player.arif', 'DEMO_HASH_REPLACE_IN_BACKEND');

INSERT INTO user_account (person_id, username, password_hash)
VALUES (100004, 'player.farzana', 'DEMO_HASH_REPLACE_IN_BACKEND');


--------------------------------------------------------------------------------
-- 5. TEAM / TEAM HISTORY / RECURSIVE MENTORSHIP
--
-- TEAM identity values on a clean V003 schema are:
--   1 = Dhaka Dominators
--   2 = Chattogram Challengers
--   3 = Sylhet Strikers
--   4 = Rajshahi Royals
--   5 = Old Town XI (soft-deleted demonstration row)
--------------------------------------------------------------------------------

INSERT INTO team (team_name, category, franchise_owner)
VALUES ('Dhaka Dominators', 'Domestic T20', 'Dhaka Sports Consortium');

INSERT INTO team (team_name, category, franchise_owner)
VALUES ('Chattogram Challengers', 'Domestic T20', 'Chattogram Sports Group');

INSERT INTO team (team_name, category, franchise_owner)
VALUES ('Sylhet Strikers', 'Domestic T20', 'Sylhet Cricket Holdings');

INSERT INTO team (team_name, category, franchise_owner)
VALUES ('Rajshahi Royals', 'Domestic T20', 'Rajshahi Sports Ventures');

INSERT INTO team (team_name, category, franchise_owner, is_deleted)
VALUES ('Old Town XI', 'Development', 'Former Development Board', 1);


INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100001, 1, DATE '2024-01-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100002, 1, DATE '2024-01-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100003, 2, DATE '2024-01-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100004, 2, DATE '2025-01-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100005, 3, DATE '2024-06-01', NULL);

-- Mehedi previously represented Dhaka, then moved to Sylhet.
INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100006, 1, DATE '2023-01-01', DATE '2024-05-31');

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100006, 3, DATE '2024-06-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100007, 4, DATE '2025-01-01', NULL);

INSERT INTO plays_for (person_id, team_id, start_date, end_date)
VALUES (100008, 4, DATE '2024-01-01', NULL);


-- Recursive mentorship history.
-- Mehedi had Arif as mentor, then Nabil became the current mentor.
INSERT INTO mentors (
    junior_id, mentor_id, mentor_since, mentor_until
) VALUES (
    100006, 100001, DATE '2024-01-01', DATE '2025-06-30'
);

INSERT INTO mentors (
    junior_id, mentor_id, mentor_since, mentor_until
) VALUES (
    100006, 100003, DATE '2025-07-01', NULL
);

INSERT INTO mentors (
    junior_id, mentor_id, mentor_since, mentor_until
) VALUES (
    100007, 100004, DATE '2025-02-01', NULL
);

INSERT INTO mentors (
    junior_id, mentor_id, mentor_since, mentor_until
) VALUES (
    100008, 100002, DATE '2024-03-01', NULL
);


--------------------------------------------------------------------------------
-- 6. PLAYER FITNESS / AVAILABILITY
--------------------------------------------------------------------------------

INSERT INTO player_fitness (
    person_id, injury_status, recovery_status, expected_return_date,
    fitness_clearance, training_available, match_available,
    recorded_date, updated_by
) VALUES (
    100001, 'FIT', 'Fully fit', NULL,
    'Y', 'Y', 'Y', DATE '2026-07-01', 200003
);

INSERT INTO player_fitness (
    person_id, injury_status, recovery_status, expected_return_date,
    fitness_clearance, training_available, match_available,
    recorded_date, updated_by
) VALUES (
    100002, 'MINOR_INJURY', 'Light training', DATE '2026-07-20',
    'N', 'Y', 'N', DATE '2026-07-08', 200003
);

INSERT INTO player_fitness (
    person_id, injury_status, recovery_status, expected_return_date,
    fitness_clearance, training_available, match_available,
    recorded_date, updated_by
) VALUES (
    100004, 'FIT', 'Cleared', NULL,
    'Y', 'Y', 'Y', DATE '2026-07-01', 200003
);

INSERT INTO player_fitness (
    person_id, injury_status, recovery_status, expected_return_date,
    fitness_clearance, training_available, match_available,
    recorded_date, updated_by
) VALUES (
    100006, 'RECOVERING', 'Rehabilitation phase', DATE '2026-08-15',
    'N', 'Y', 'N', DATE '2026-08-01', 200003
);

INSERT INTO player_fitness (
    person_id, injury_status, recovery_status, expected_return_date,
    fitness_clearance, training_available, match_available,
    recorded_date, updated_by
) VALUES (
    100008, 'FIT', 'Fully fit', NULL,
    'Y', 'Y', 'Y', DATE '2026-07-01', 200003
);


--------------------------------------------------------------------------------
-- 7. TOURNAMENT / SPONSORS / MATCHES / PARTICIPATING TEAMS
--
-- TOURNAMENT identity values:
--   1 = National T20 Championship
--   2 = Premier One-Day Cup
--
-- MATCH sequence values:
--   1 = Dhaka vs Chattogram, completed
--   2 = Sylhet vs Rajshahi, completed
--   3 = Dhaka vs Sylhet, scheduled
--   4 = Chattogram vs Rajshahi, completed ODI
--------------------------------------------------------------------------------

INSERT INTO tournament (tournament_name, tournament_tier_level, season_year)
VALUES ('National T20 Championship', 'National', 2026);

INSERT INTO tournament (tournament_name, tournament_tier_level, season_year)
VALUES ('Premier One-Day Cup', 'National', 2026);


INSERT INTO tournament_sponsor (tournament_id, sponsor)
VALUES (1, 'Bangla Telecom');

INSERT INTO tournament_sponsor (tournament_id, sponsor)
VALUES (1, 'Victory Bank');

INSERT INTO tournament_sponsor (tournament_id, sponsor)
VALUES (2, 'Padma Electronics');

-- Intentionally soft-deleted former sponsor.
INSERT INTO tournament_sponsor (tournament_id, sponsor, is_deleted)
VALUES (2, 'Legacy Motors', 1);


INSERT INTO match (
    tournament_id, match_date, venue, match_format,
    match_status, result, winner_team_id
) VALUES (
    1, DATE '2026-07-10', 'Sher-e-Bangla National Cricket Stadium',
    'T20', 'COMPLETED', 'Dhaka Dominators won by 18 runs', 1
);

INSERT INTO match (
    tournament_id, match_date, venue, match_format,
    match_status, result, winner_team_id
) VALUES (
    1, DATE '2026-07-12', 'Sylhet International Cricket Stadium',
    'T20', 'COMPLETED', 'Sylhet Strikers won by 6 wickets', 3
);

INSERT INTO match (
    tournament_id, match_date, venue, match_format,
    match_status, result, winner_team_id
) VALUES (
    1, DATE '2026-09-05', 'Sher-e-Bangla National Cricket Stadium',
    'T20', 'SCHEDULED', NULL, NULL
);

INSERT INTO match (
    tournament_id, match_date, venue, match_format,
    match_status, result, winner_team_id
) VALUES (
    2, DATE '2026-08-05', 'Zahur Ahmed Chowdhury Stadium',
    'ODI', 'COMPLETED', 'Rajshahi Royals won by 4 wickets', 4
);


INSERT INTO includes (match_id, team_id) VALUES (1, 1);
INSERT INTO includes (match_id, team_id) VALUES (1, 2);

INSERT INTO includes (match_id, team_id) VALUES (2, 3);
INSERT INTO includes (match_id, team_id) VALUES (2, 4);

INSERT INTO includes (match_id, team_id) VALUES (3, 1);
INSERT INTO includes (match_id, team_id) VALUES (3, 3);

INSERT INTO includes (match_id, team_id) VALUES (4, 2);
INSERT INTO includes (match_id, team_id) VALUES (4, 4);


--------------------------------------------------------------------------------
-- 8. CAREER RECORDS
--
-- CAREER_RECORD identity values 1..8 correspond to players 100001..100008.
--------------------------------------------------------------------------------

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100001, 1, 'National', 'Domestic',
    28, DATE '2024-01-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100002, 1, 'National', 'Domestic',
    26, DATE '2024-01-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100003, 2, 'National', 'Domestic',
    35, DATE '2024-01-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100004, 2, 'National', 'Domestic',
    22, DATE '2025-01-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100005, 3, 'National', 'Domestic',
    19, DATE '2024-06-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100006, 3, 'National', 'Domestic',
    31, DATE '2024-06-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100007, 4, 'National', 'Domestic',
    17, DATE '2025-01-01', NULL
);

INSERT INTO career_record (
    person_id, team_id, tier_level, location_type,
    matches_played, start_date, end_date
) VALUES (
    100008, 4, 'National', 'Domestic',
    24, DATE '2024-01-01', NULL
);


--------------------------------------------------------------------------------
-- 9. FORMAT SUMMARIES
--------------------------------------------------------------------------------

-- BATTING_SUMMARY identity IDs 1..9.
INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (1, 842, 35.08, 138.40, 92, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (3, 725, 31.52, 132.75, 78, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (4, 590, 32.78, 129.30, 74, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (5, 611, 33.94, 136.20, 81, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (6, 688, 30.91, 144.10, 76, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (7, 544, 36.27, 127.80, 84, 'T20');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (3, 1180, 42.14, 91.60, 112, 'ODI');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (4, 805, 38.33, 88.40, 96, 'ODI');

INSERT INTO batting_summary
(record_id, total_runs, batting_avg, strike_rate, highest_score, format)
VALUES (7, 940, 44.76, 93.20, 109, 'ODI');


-- BOWLING_SUMMARY identity IDs 1..6.
INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (2, 41, 22.80, '4/18', 6.70, 'T20');

INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (3, 29, 25.10, '3/21', 7.10, 'T20');

INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (6, 35, 23.65, '4/24', 6.95, 'T20');

INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (8, 46, 21.90, '5/19', 6.40, 'T20');

INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (3, 34, 30.50, '4/39', 5.35, 'ODI');

INSERT INTO bowling_summary
(record_id, total_wickets, bowling_avg, best_bowling_figures, economy_rate, format)
VALUES (8, 52, 27.80, '5/41', 4.95, 'ODI');


-- FIELDING_SUMMARY identity IDs 1..11.
INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (1, 12, 0, 3, 2, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (2, 8, 0, 2, 2, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (3, 14, 0, 4, 3, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (4, 20, 11, 3, 4, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (5, 9, 0, 2, 2, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (6, 13, 0, 5, 3, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (7, 10, 0, 3, 2, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (8, 7, 0, 2, 2, 'T20');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (3, 18, 0, 6, 3, 'ODI');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (4, 27, 15, 4, 5, 'ODI');

INSERT INTO fielding_summary
(record_id, total_catches, total_stumpings, total_runouts, most_dismissals_in_match, format)
VALUES (7, 16, 0, 4, 3, 'ODI');


--------------------------------------------------------------------------------
-- 10. MATCH PERFORMANCE
--
-- Match 3 is scheduled, so it intentionally has no performance rows.
--------------------------------------------------------------------------------

-- Match 1: Dhaka Dominators vs Chattogram Challengers.
INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (1, 1, 72, 48, 150.00, 'Caught');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (2, 1, 44, 31, 141.94, 'Bowled');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (3, 1, 28, 22, 127.27, 'Run out');

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (1, 1, 3, 24, 26, 6.50);

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (2, 1, 1, 18, 22, 7.33);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (1, 1, 1, 0, 0, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (2, 1, 1, 0, 0, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (3, 1, 1, 0, 1, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (4, 1, 2, 1, 0, 2);


-- Match 2: Sylhet Strikers vs Rajshahi Royals.
INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (4, 2, 51, 37, 137.84, 'Caught');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (5, 2, 35, 20, 175.00, 'Not out');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (6, 2, 47, 39, 120.51, 'LBW');

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (3, 2, 2, 24, 28, 7.00);

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (4, 2, 3, 24, 30, 7.50);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (5, 2, 1, 0, 0, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (6, 2, 1, 0, 1, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (7, 2, 2, 0, 0, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (8, 2, 1, 0, 0, 0);


-- Match 4: ODI, Chattogram Challengers vs Rajshahi Royals.
INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (7, 4, 65, 72, 90.28, 'Caught');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (8, 4, 38, 45, 84.44, 'Stumped');

INSERT INTO batting_performance
(bat_summary_id, match_id, runs_scored, balls_faced, strike_rate, dismissal_type)
VALUES (9, 4, 82, 91, 90.11, 'Not out');

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (5, 4, 2, 48, 44, 5.50);

INSERT INTO bowling_performance
(bowl_summary_id, match_id, wickets_taken, balls_bowled, runs_conceded, economy_rate)
VALUES (6, 4, 4, 60, 46, 4.60);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (9, 4, 2, 0, 1, 0);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (10, 4, 3, 1, 0, 3);

INSERT INTO fielding_performance
(field_summary_id, match_id, catches, stumpings, runs_out_direct, byes_conceded)
VALUES (11, 4, 2, 0, 1, 0);


--------------------------------------------------------------------------------
-- 11. RULEBOOK
--
-- RULEBOOK identity IDs 1..6.
--------------------------------------------------------------------------------

INSERT INTO rulebook (clause_no, category)
VALUES ('1.1', 'Anti-Corruption');

INSERT INTO rulebook (clause_no, category)
VALUES ('1.2', 'Anti-Corruption');

INSERT INTO rulebook (clause_no, category)
VALUES ('2.1', 'Code of Conduct');

INSERT INTO rulebook (clause_no, category)
VALUES ('2.2', 'Code of Conduct');

INSERT INTO rulebook (clause_no, category)
VALUES ('3.1', 'Match Integrity');

INSERT INTO rulebook (clause_no, category)
VALUES ('4.1', 'Confidentiality');


--------------------------------------------------------------------------------
-- 12. COMPLAINTS
--
-- Complaint sequence IDs 1..6.
-- Complaints 5 and 6 intentionally have no linked case.
--------------------------------------------------------------------------------

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Match Official Report', DATE '2026-06-15',
    'Unusual communication was observed before a domestic match.',
    'Integrity Concern'
);

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Team Management Report', DATE '2026-06-22',
    'Player behaviour during team activities requires investigation.',
    'Misconduct'
);

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Anonymous Tip', DATE '2026-07-01',
    'Possible unauthorized sharing of confidential match information.',
    'Confidentiality Concern'
);

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Security Report', DATE '2026-07-15',
    'Suspicious contact with an unauthorized individual was reported.',
    'Possible Corruption'
);

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Email', DATE '2026-08-02',
    'Complaint is waiting for preliminary assessment.',
    'Misconduct'
);

INSERT INTO complaint
(source_type, date_received, description, misconduct_type)
VALUES (
    'Hotline Report', DATE '2026-08-05',
    'Information received through the integrity reporting channel.',
    'Integrity Concern'
);


--------------------------------------------------------------------------------
-- 13. CASE RECORDS
--
-- Case 5 intentionally originates from suspicious activity and therefore has
-- no SOURCE_OF row.
-- Case 5 also intentionally has no evidence yet.
--------------------------------------------------------------------------------

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'OPEN', 'Primary Subject', DATE '2026-06-16',
    'NOT_REFERRED', NULL
);

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'UNDER_INVESTIGATION', 'Primary Subject', DATE '2026-06-23',
    'NOT_REFERRED', NULL
);

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'REFERRED', 'Primary Subject', DATE '2026-07-02',
    'REFERRED', 'National Anti-Corruption Authority'
);

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'CLOSED', 'Associated Player', DATE '2026-05-20',
    'NOT_REFERRED', NULL
);

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'OPEN', 'Primary Subject', DATE '2026-07-22',
    'NOT_REFERRED', NULL
);

INSERT INTO case_record
(status, involvement_type, date_opened, referral_status, referred_to_authority)
VALUES (
    'UNDER_INVESTIGATION', 'Associated Player', DATE '2026-07-16',
    'NOT_REFERRED', NULL
);


--------------------------------------------------------------------------------
-- 14. CASE RELATIONSHIPS
--------------------------------------------------------------------------------

-- SOURCE_OF: complaints 5 and 6 remain unlinked; case 5 has no complaint.
INSERT INTO source_of (case_id, complaint_id) VALUES (1, 1);
INSERT INTO source_of (case_id, complaint_id) VALUES (2, 2);
INSERT INTO source_of (case_id, complaint_id) VALUES (3, 3);
INSERT INTO source_of (case_id, complaint_id) VALUES (4, 4);


-- INVOLVES_IN: every case has at least one player involvement.
INSERT INTO involves_in (person_id, case_id) VALUES (100001, 1);
INSERT INTO involves_in (person_id, case_id) VALUES (100002, 1);

INSERT INTO involves_in (person_id, case_id) VALUES (100003, 2);
INSERT INTO involves_in (person_id, case_id) VALUES (100004, 2);

INSERT INTO involves_in (person_id, case_id) VALUES (100005, 3);

INSERT INTO involves_in (person_id, case_id) VALUES (100006, 4);

INSERT INTO involves_in (person_id, case_id) VALUES (100007, 5);

INSERT INTO involves_in (person_id, case_id) VALUES (100002, 6);
INSERT INTO involves_in (person_id, case_id) VALUES (100008, 6);


-- INVESTIGATES: all assigned admins are Integrity & Compliance Officers.
-- 100007 / case 5 intentionally has no investigator for NOT EXISTS queries.
INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100001, 1, 200005);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100002, 1, 200006);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100003, 2, 200005);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100004, 2, 200006);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100005, 3, 200005);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100006, 4, 200006);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100002, 6, 200005);

INSERT INTO investigates (person_id, case_id, admin_id)
VALUES (100008, 6, 200006);


-- VIOLATES: rule 1 and rule 3 occur repeatedly for GROUP BY / HAVING demos.
INSERT INTO violates (case_id, rule_id) VALUES (1, 1);
INSERT INTO violates (case_id, rule_id) VALUES (1, 3);

INSERT INTO violates (case_id, rule_id) VALUES (2, 2);
INSERT INTO violates (case_id, rule_id) VALUES (2, 3);

INSERT INTO violates (case_id, rule_id) VALUES (3, 1);
INSERT INTO violates (case_id, rule_id) VALUES (3, 6);

INSERT INTO violates (case_id, rule_id) VALUES (4, 4);

INSERT INTO violates (case_id, rule_id) VALUES (5, 3);

INSERT INTO violates (case_id, rule_id) VALUES (6, 1);
INSERT INTO violates (case_id, rule_id) VALUES (6, 5);


--------------------------------------------------------------------------------
-- 15. EVIDENCE
--
-- Case 5 intentionally has no evidence.
--------------------------------------------------------------------------------

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    1, 1,
    'Match official communication log.',
    DATE '2026-06-17'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    1, 2,
    'Statement collected from team management.',
    DATE '2026-06-18'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    2, 1,
    'Team disciplinary report.',
    DATE '2026-06-24'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    2, 2,
    'Player interview summary.',
    DATE '2026-06-25'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    3, 1,
    'Digital communication records.',
    DATE '2026-07-03'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    3, 2,
    'Confidential document access record.',
    DATE '2026-07-04'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    4, 1,
    'Case closure report and final review notes.',
    DATE '2026-06-01'
);

INSERT INTO evidence
(case_id, evidence_no, description, collected_date)
VALUES (
    6, 1,
    'Security department incident report.',
    DATE '2026-07-17'
);


--------------------------------------------------------------------------------
-- 16. ADMIN OBSERVATIONS OF PLAYERS IN MATCHES
--------------------------------------------------------------------------------

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200003, 100001, 1, DATE '2026-07-10',
    'Strong control of the chase and good strike rotation.'
);

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200004, 100002, 1, DATE '2026-07-10',
    'Maintained disciplined line and length during the powerplay.'
);

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200003, 100006, 2, DATE '2026-07-12',
    'Contributed effectively with both bat and ball.'
);

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200004, 100007, 2, DATE '2026-07-12',
    'Handled pressure well despite the match result.'
);

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200003, 100004, 4, DATE '2026-08-05',
    'Good wicketkeeping involvement and composed middle-order batting.'
);

INSERT INTO observes
(admin_id, player_id, match_id, observation_date, remarks)
VALUES (
    200004, 100008, 4, DATE '2026-08-05',
    'Excellent control in the middle overs and decisive wicket-taking spell.'
);


--------------------------------------------------------------------------------
-- 17. AUDIT LOG
--
-- Intentionally left empty.
-- AUDIT_LOG should normally be populated by the audit triggers added later,
-- rather than by fabricated seed rows.
--------------------------------------------------------------------------------


COMMIT;

--------------------------------------------------------------------------------
-- END OF V003 DEMO DATA
--------------------------------------------------------------------------------
