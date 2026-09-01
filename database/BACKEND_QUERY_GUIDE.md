# PitchSync Backend Query Guide

This guide documents every Oracle SQL statement used by the Next.js server layer. All user-controlled values use bind variables. Database credentials are never included here.

## Connection / Health

### Database health context

Purpose: Verify that the backend pool reaches the expected PitchSync schema and pluggable database.

Frontend use: `GET /api/health/database` and local integration checks.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,
       SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
FROM dual;
```

Bind variables: None.

How it works: Oracle returns the authenticated schema user and current container from the active pooled connection.

Result: One row containing `PITCHSYNC_OWNER` and `PITCHPDB` for the approved local target.

## Authentication

### Active login account lookup

Purpose: Resolve an active V003 account, person, and application role by username or administrator email before password verification.

Frontend use: `POST /api/auth/login`.

Source: Application login form of the V003 account-directory relationship used in catalogue query `A01_admin_account_directory.sql`.

SQL:

```sql
SELECT ua.account_id, ua.person_id, ua.username, ua.password_hash,
       p.first_name || ' ' || p.last_name AS full_name,
       a.designation, pl.person_id AS player_id
FROM user_account ua
JOIN person p ON p.person_id = ua.person_id AND p.is_deleted = 0
LEFT JOIN admin a ON a.person_id = ua.person_id AND a.is_deleted = 0
LEFT JOIN player pl ON pl.person_id = ua.person_id AND pl.is_deleted = 0
WHERE (LOWER(ua.username) = LOWER(:identifier)
       OR LOWER(a.email) = LOWER(:identifier))
  AND ua.account_status = 'ACTIVE'
  AND ua.is_deleted = 0;
```

Bind variables: `identifier`.

How it works: The server derives the approved role from ADMIN designation or PLAYER specialization, verifies that it matches the selected role, and compares the submitted password to `password_hash` with bcrypt. The hash is never returned to the browser.

Expected result/change: One eligible account or no row. Read-only; no transaction changes.

### Successful-login timestamp

Purpose: Record the most recent successful authentication time.

Frontend use: Successful `POST /api/auth/login` transaction.

Source: NEW BACKEND QUERY

SQL:

```sql
UPDATE user_account
SET last_login = SYSTIMESTAMP
WHERE account_id = :accountId AND is_deleted = 0;
```

Bind variables: `accountId` from the already authenticated account row.

How it works: This statement executes only after password and selected-role verification succeeds.

Expected result/change: One account timestamp updated. It commits with the login transaction; any failure rolls back.

### Local account activation

Purpose: Replace V003's intentionally unusable seed marker with a bcrypt hash and activate each existing local account without creating another account table.

Frontend use: One-time `npm run auth:activate-local` local setup; credentials are stored only in the Git-ignored local credentials file.

Source: NEW LOCAL SETUP QUERY

SQL:

```sql
UPDATE user_account
SET password_hash = :passwordHash,
    account_status = 'ACTIVE',
    is_deleted = 0
WHERE username = :username;
```

Bind variables: `passwordHash` (bcrypt cost 12) and each fixed local V003 `username`.

How it works: The setup script verifies the exact `localhost:1522/PITCHPDB` target, updates all eight existing seed accounts in one transaction, and never prints the password or hash.

Expected result/change: Eight existing local accounts activated. All updates commit together; any mismatch or error rolls back.

## Role dashboards

The dashboard API reuses the documented player, team, tournament, match, performance-player, complaint, case, and player-performance detail queries with `page = 1` and a five-row limit. It maps those existing queries to `/api/dashboard` according to the authenticated role; the player role always binds the person identifier from the signed session.

### Performance dashboard totals

Purpose: Count active career and format-summary records for the Team Performance Manager dashboard.

Frontend use: `/performance/dashboard` through `GET /api/dashboard`.

Source: NEW BACKEND READ.

SQL:

```sql
SELECT
  (SELECT COUNT(*) FROM career_record WHERE is_deleted = 0) AS career_count,
  (SELECT COUNT(*) FROM batting_summary WHERE is_deleted = 0) AS batting_count,
  (SELECT COUNT(*) FROM bowling_summary WHERE is_deleted = 0) AS bowling_count,
  (SELECT COUNT(*) FROM fielding_summary WHERE is_deleted = 0) AS fielding_count
FROM dual;
```

Bind variables: None.

How it works: Independent scalar counts return one metric row and consistently exclude soft-deleted records.

Expected result/change: One totals row. Read-only; no transaction changes.

### Recent match-performance coverage

Purpose: Show the latest player/match combinations and which performance categories have records.

Frontend use: Performance dashboard match-performance table.

Source: NEW BACKEND READ using the V003 performance relationships.

SQL:

```sql
WITH performance_entry AS (
  SELECT bp.match_id, cr.person_id, 'BATTING' AS performance_type
  FROM batting_performance bp
  JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id AND bs.is_deleted = 0
  JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
  WHERE bp.is_deleted = 0
  UNION ALL
  SELECT bp.match_id, cr.person_id, 'BOWLING'
  FROM bowling_performance bp
  JOIN bowling_summary bs ON bs.bowl_summary_id = bp.bowl_summary_id AND bs.is_deleted = 0
  JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
  WHERE bp.is_deleted = 0
  UNION ALL
  SELECT fp.match_id, cr.person_id, 'FIELDING'
  FROM fielding_performance fp
  JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id AND fs.is_deleted = 0
  JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0
  WHERE fp.is_deleted = 0
)
SELECT pe.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, p.person_id,
       p.first_name || ' ' || p.last_name AS player_name,
       SUM(CASE WHEN pe.performance_type = 'BATTING' THEN 1 ELSE 0 END) AS batting_count,
       SUM(CASE WHEN pe.performance_type = 'BOWLING' THEN 1 ELSE 0 END) AS bowling_count,
       SUM(CASE WHEN pe.performance_type = 'FIELDING' THEN 1 ELSE 0 END) AS fielding_count
FROM performance_entry pe
JOIN match m ON m.match_id = pe.match_id AND m.is_deleted = 0
JOIN person p ON p.person_id = pe.person_id AND p.is_deleted = 0
JOIN player pl ON pl.person_id = p.person_id AND pl.is_deleted = 0
GROUP BY pe.match_id, m.match_date, p.person_id, p.first_name, p.last_name
ORDER BY m.match_date DESC, pe.match_id DESC, p.person_id
FETCH FIRST 5 ROWS ONLY;
```

Bind variables: None.

How it works: A CTE normalizes the three V003 performance tables, then conditional aggregation reports category coverage without inventing combined performance records.

Expected result/change: Up to five recent player/match coverage rows. Read-only; no transaction changes.

### Match-operations dashboard totals

Purpose: Count active matches, tournaments, performance entries, and observations.

Frontend use: `/match-official/dashboard` metrics.

Source: NEW BACKEND READ.

SQL:

```sql
SELECT
  (SELECT COUNT(*) FROM match WHERE is_deleted = 0) AS match_count,
  (SELECT COUNT(*) FROM tournament WHERE is_deleted = 0) AS tournament_count,
  ((SELECT COUNT(*) FROM batting_performance WHERE is_deleted = 0)
   + (SELECT COUNT(*) FROM bowling_performance WHERE is_deleted = 0)
   + (SELECT COUNT(*) FROM fielding_performance WHERE is_deleted = 0)) AS performance_count,
  (SELECT COUNT(*) FROM observes WHERE is_deleted = 0) AS observation_count
FROM dual;
```

Bind variables: None.

How it works: Counts only active physical records and sums the separate performance subtypes for the combined UI metric.

Expected result/change: One totals row. Read-only; no transaction changes.

### Recent match performance counts

Purpose: Show batting, bowling, and fielding entry coverage for recent matches.

Frontend use: Match Official dashboard performance-coverage table.

Source: NEW BACKEND READ.

SQL:

```sql
SELECT m.match_id,
  (SELECT COUNT(*) FROM batting_performance bp WHERE bp.match_id = m.match_id AND bp.is_deleted = 0) AS batting_count,
  (SELECT COUNT(*) FROM bowling_performance bp WHERE bp.match_id = m.match_id AND bp.is_deleted = 0) AS bowling_count,
  (SELECT COUNT(*) FROM fielding_performance fp WHERE fp.match_id = m.match_id AND fp.is_deleted = 0) AS fielding_count
FROM match m
WHERE m.is_deleted = 0
ORDER BY m.match_date DESC, m.match_id DESC
FETCH FIRST 5 ROWS ONLY;
```

Bind variables: None.

How it works: Correlated counts preserve the three V003 performance subtypes while summarizing their coverage per active match.

Expected result/change: Up to five recent match rows. Read-only; no transaction changes.

### Recent administrative observations

Purpose: Show recent active player observations with match context.

Frontend use: Match Official dashboard observation table.

Source: NEW BACKEND READ using V003 `OBSERVES`.

SQL:

```sql
SELECT o.match_id, p.first_name || ' ' || p.last_name AS player_name,
       TO_CHAR(o.observation_date, 'YYYY-MM-DD') AS observation_date, o.remarks
FROM observes o
JOIN person p ON p.person_id = o.player_id AND p.is_deleted = 0
JOIN match m ON m.match_id = o.match_id AND m.is_deleted = 0
WHERE o.is_deleted = 0
ORDER BY o.observation_date DESC, o.match_id DESC
FETCH FIRST 5 ROWS ONLY;
```

Bind variables: None.

How it works: Resolves the observed player through PERSON and excludes deleted observations, people, and matches.

Expected result/change: Up to five recent observation rows. Read-only; no transaction changes.

### Integrity assignment and evidence totals

Purpose: Count distinct assigned investigators and active evidence items.

Frontend use: `/integrity/dashboard` metrics.

Source: NEW BACKEND READ.

SQL:

```sql
SELECT
  (SELECT COUNT(DISTINCT admin_id) FROM investigates WHERE is_deleted = 0) AS investigator_count,
  (SELECT COUNT(*) FROM evidence WHERE is_deleted = 0) AS evidence_count
FROM dual;
```

Bind variables: None.

How it works: Investigator assignments remain a relationship-driven metric; no separate investigator module is introduced.

Expected result/change: One totals row. Read-only; no transaction changes.

## Players

### Player registry count

Purpose: Count active players after applying the registry filters so the API can return accurate pagination metadata.

Frontend use: Player registry search, playing-role filter, gender filter, and team filter.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM person p
JOIN player pl ON pl.person_id = p.person_id
WHERE p.is_deleted = 0
  AND pl.is_deleted = 0
  -- Optional: AND (UPPER(p.first_name || ' ' || p.last_name) LIKE :search
  --                OR TO_CHAR(p.person_id) LIKE :search)
  -- Optional: AND pl.player_role = :role
  -- Optional: AND pl.gender = :gender
  -- Optional: AND EXISTS (
  --   SELECT 1 FROM plays_for pf_filter
  --   WHERE pf_filter.person_id = p.person_id
  --     AND pf_filter.team_id = :teamId
  --     AND pf_filter.is_deleted = 0
  -- )
```

Bind variables: `search` (uppercased contains search), `role`, `gender`, and `teamId` are included only when their validated filter is present.

How it works: The API constructs only the documented optional clauses and supplies every filter value as a bind.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated player registry

Purpose: Return one page of active player identity, role, primary phone, and team-association counts.

Frontend use: `/players` table, filters, server-side sort, and pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT p.person_id,
       p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role,
       pl.gender,
       (SELECT MIN(pp.phone)
          FROM person_phone pp
         WHERE pp.person_id = p.person_id AND pp.is_deleted = 0) AS phone,
       (SELECT COUNT(DISTINCT pf.team_id)
          FROM plays_for pf
         WHERE pf.person_id = p.person_id AND pf.is_deleted = 0) AS team_association_count
FROM person p
JOIN player pl ON pl.person_id = p.person_id
WHERE p.is_deleted = 0 AND pl.is_deleted = 0
  -- The same optional bound filters documented above are inserted here.
ORDER BY /* one server-whitelisted expression: name, id, or role */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional `search`, `role`, `gender`, `teamId`; required `rowOffset` and `rowLimit`.

How it works: Sorting is selected from a fixed server-side map and never accepted as raw SQL. Oracle performs filtering and pagination before rows reach React.

Expected result/change: Zero or more player list rows. Read-only; no transaction changes.

### Player team filter options

Purpose: Supply active teams for the player registry team filter.

Frontend use: Team dropdown on `/players`.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT team_id, team_name, category, franchise_owner
FROM team
WHERE is_deleted = 0
ORDER BY team_name, team_id;
```

Bind variables: None.

How it works: Active teams are returned in a deterministic display order.

Expected result/change: Zero or more option rows. Read-only; no transaction changes.

### Player profile identity

Purpose: Load the active PERSON and PLAYER attributes for one player profile.

Frontend use: `/players/[playerId]` header, personal-information section, and playing-information section.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT p.person_id, p.first_name, p.last_name,
       TO_CHAR(p.dob, 'YYYY-MM-DD') AS dob,
       p.present_address.address_line AS present_address_line,
       p.present_address.upazila_or_thana AS present_upazila,
       p.present_address.district AS present_district,
       p.present_address.division AS present_division,
       p.permanent_address.address_line AS permanent_address_line,
       p.permanent_address.upazila_or_thana AS permanent_upazila,
       p.permanent_address.district AS permanent_district,
       p.permanent_address.division AS permanent_division,
       pl.player_role, pl.gender, pl.family_background
FROM person p
JOIN player pl ON pl.person_id = p.person_id
WHERE p.person_id = :playerId
  AND p.is_deleted = 0
  AND pl.is_deleted = 0;
```

Bind variables: `playerId`.

How it works: The subtype is joined to its PERSON supertype and Oracle object-address attributes are projected into simple API fields.

Expected result/change: One row for an active player or no row for a missing/deleted player. Read-only; no transaction changes.

### Player phones

Purpose: Load all active phone values for a player.

Frontend use: Player profile contact information.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT phone AS value
FROM person_phone
WHERE person_id = :playerId AND is_deleted = 0
ORDER BY phone;
```

Bind variables: `playerId`.

How it works: The multivalued phone relation is filtered by the owning PERSON key and soft-delete marker.

Expected result/change: Zero or more phone rows. Read-only; no transaction changes.

### Player achievements

Purpose: Load all active achievements for a player.

Frontend use: Player profile Achievements tab.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT achievement AS value
FROM player_achievement
WHERE person_id = :playerId AND is_deleted = 0
ORDER BY achievement;
```

Bind variables: `playerId`.

How it works: The multivalued achievement relation is filtered by the owning PLAYER key and soft-delete marker.

Expected result/change: Zero or more achievement rows. Read-only; no transaction changes.

### Player education

Purpose: Load all active structured education entries for a player.

Frontend use: Player profile playing-information section.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT pe.education_info.degree_class AS degree_class,
       pe.education_info.institute_or_board AS institute_or_board,
       pe.education_info.result AS result,
       pe.education_info.subject AS subject
FROM player_education pe
WHERE pe.person_id = :playerId AND pe.is_deleted = 0
ORDER BY pe.education_no;
```

Bind variables: `playerId`.

How it works: Oracle education object attributes are projected into simple values in education-number order.

Expected result/change: Zero or more education rows. Read-only; no transaction changes.

### Player team associations

Purpose: Load distinct active teams associated with a player through `PLAYS_FOR`.

Frontend use: Player profile Team Associations tab.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT DISTINCT t.team_id, t.team_name, t.category, t.franchise_owner
FROM plays_for pf
JOIN team t ON t.team_id = pf.team_id AND t.is_deleted = 0
WHERE pf.person_id = :playerId AND pf.is_deleted = 0
ORDER BY t.team_name, t.team_id;
```

Bind variables: `playerId`.

How it works: Team membership stays modeled through the player-team relationship rather than attaching career records directly to the UI team model.

Expected result/change: Zero or more team rows. Read-only; no transaction changes.

### Player career records

Purpose: Load active career-record headings for a player.

Frontend use: Player profile Career Records tab and grouping of format summaries.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT record_id, tier_level, location_type, matches_played,
       TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
FROM career_record
WHERE person_id = :playerId AND is_deleted = 0
ORDER BY start_date DESC, record_id DESC;
```

Bind variables: `playerId`.

How it works: Career headings are returned independently, then the server groups the three format-summary result sets by `record_id`.

Expected result/change: Zero or more career records. Read-only; no transaction changes.

### Player batting summaries

Purpose: Load active batting summaries grouped under the player's career records.

Frontend use: Player profile batting aggregate and career data model.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT bs.bat_summary_id AS summary_id, bs.record_id, bs.format,
       bs.total_runs, bs.batting_avg AS batting_average,
       bs.strike_rate, bs.highest_score
FROM batting_summary bs
JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
WHERE cr.person_id = :playerId AND bs.is_deleted = 0
ORDER BY bs.record_id, bs.format;
```

Bind variables: `playerId`.

How it works: Active summary rows are restricted through the player's active career records and grouped in the server response by `record_id`.

Expected result/change: Zero or more batting summaries. Read-only; no transaction changes.

### Player bowling summaries

Purpose: Load active bowling summaries grouped under the player's career records.

Frontend use: Player profile bowling aggregate and career data model.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT bs.bowl_summary_id AS summary_id, bs.record_id, bs.format,
       bs.total_wickets, bs.bowling_avg AS bowling_average,
       bs.best_bowling_figures
FROM bowling_summary bs
JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
WHERE cr.person_id = :playerId AND bs.is_deleted = 0
ORDER BY bs.record_id, bs.format;
```

Bind variables: `playerId`.

How it works: Active summary rows are restricted through the player's active career records and grouped in the server response by `record_id`.

Expected result/change: Zero or more bowling summaries. Read-only; no transaction changes.

### Player fielding summaries

Purpose: Load active fielding summaries grouped under the player's career records.

Frontend use: Player profile fielding aggregate and career data model.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT fs.field_summary_id AS summary_id, fs.record_id, fs.format,
       fs.total_catches, fs.total_stumpings, fs.total_runouts,
       fs.most_dismissals_in_match
FROM fielding_summary fs
JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0
WHERE cr.person_id = :playerId AND fs.is_deleted = 0
ORDER BY fs.record_id, fs.format;
```

Bind variables: `playerId`.

How it works: Active summary rows are restricted through the player's active career records and grouped in the server response by `record_id`.

Expected result/change: Zero or more fielding summaries. Read-only; no transaction changes.

### Allocate a player reference

Purpose: Obtain the next user-facing PLAYER/PERSON reference for a registration transaction.

Frontend use: `POST /api/players` from `/players/new`.

Source: V003 `SEQ_PLAYER_PERSON` allocation rule.

SQL:

```sql
SELECT seq_player_person.NEXTVAL AS person_id FROM dual;
```

Bind variables: None.

How it works: The explicit V003 sequence keeps player references in their approved range.

Expected result/change: One numeric reference. Sequence advancement is Oracle non-transactional; all table writes using it are transactional.

### Create PERSON and PLAYER

Purpose: Persist the supertype and player subtype for a new registration.

Frontend use: `POST /api/players`.

Source: NEW BACKEND WRITE using the V003 specialization model.

SQL:

```sql
INSERT INTO person (
  person_id, first_name, last_name, dob, present_address, permanent_address
) VALUES (
  :playerId, :firstName, :lastName, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
  address_type(:presentAddress, :presentUpazila, :presentDistrict, :presentDivision),
  address_type(:permanentAddress, :permanentUpazila, :permanentDistrict, :permanentDivision)
);

INSERT INTO player (person_id, player_role, gender, family_background)
VALUES (:playerId, :playerRole, :gender, :familyBackground);
```

Bind variables: `playerId`, validated identity/date/address values, `playerRole`, `gender`, and optional `familyBackground`.

How it works: PERSON is inserted first so the PLAYER foreign key is always valid; structured addresses use the V003 Oracle object type.

Expected result/change: One PERSON and one PLAYER row. Both commit with the registration transaction; any failure rolls all table writes back.

### Replace player phone collection

Purpose: Make the single existing form phone value the active phone collection while retaining old rows as soft-deleted history.

Frontend use: Player create/update form.

Source: NEW BACKEND WRITE

SQL:

```sql
UPDATE person_phone SET is_deleted = 1 WHERE person_id = :playerId;

MERGE INTO person_phone target
USING (SELECT :playerId AS person_id, :phone AS phone FROM dual) source
ON (target.person_id = source.person_id AND target.phone = source.phone)
WHEN MATCHED THEN UPDATE SET target.is_deleted = 0
WHEN NOT MATCHED THEN
  INSERT (person_id, phone, is_deleted)
  VALUES (source.person_id, source.phone, 0);
```

Bind variables: `playerId`; optional validated `phone` for the MERGE.

How it works: Existing keys can be reactivated without violating the composite primary key; blank phone input leaves all phone rows inactive.

Expected result/change: Prior phone rows soft-deleted and zero or one phone active. Executes inside the enclosing create/update transaction.

### Replace primary education value

Purpose: Update the form-managed primary education entry without discarding other structured education entries.

Frontend use: Player create/update form.

Source: NEW BACKEND WRITE using V003 `EDUCATION_TYPE`.

SQL:

```sql
UPDATE player_education
SET is_deleted = 1
WHERE person_id = :playerId AND education_no = 1;

MERGE INTO player_education target
USING (SELECT :playerId AS person_id, 1 AS education_no FROM dual) source
ON (target.person_id = source.person_id
    AND target.education_no = source.education_no)
WHEN MATCHED THEN UPDATE SET
  target.education_info = education_type(
    :education,
    target.education_info.institute_or_board,
    target.education_info.result,
    target.education_info.subject
  ),
  target.is_deleted = 0
WHEN NOT MATCHED THEN
  INSERT (person_id, education_no, education_info, is_deleted)
  VALUES (source.person_id, source.education_no,
          education_type(:education, NULL, NULL, NULL), 0);
```

Bind variables: `playerId`; optional validated `education` for the MERGE.

How it works: The current form manages `education_no = 1`; updates preserve its other object attributes and never remove additional education rows.

Expected result/change: Primary education inactive or active with the supplied level. Executes inside the enclosing transaction.

### Replace player achievements

Purpose: Persist the newline-separated achievements entered in the existing player form.

Frontend use: Player create/update form.

Source: NEW BACKEND WRITE

SQL:

```sql
UPDATE player_achievement
SET is_deleted = 1
WHERE person_id = :playerId;

MERGE INTO player_achievement target
USING (SELECT :playerId AS person_id,
              :achievement AS achievement FROM dual) source
ON (target.person_id = source.person_id
    AND target.achievement = source.achievement)
WHEN MATCHED THEN UPDATE SET target.is_deleted = 0
WHEN NOT MATCHED THEN
  INSERT (person_id, achievement, is_deleted)
  VALUES (source.person_id, source.achievement, 0);
```

Bind variables: `playerId`; one validated `achievement` per deduplicated entry for each MERGE.

How it works: Existing values are reactivated by composite key and removed form values remain soft-deleted.

Expected result/change: The submitted set becomes active. All statements execute in one create/update transaction.

### Update PERSON and PLAYER

Purpose: Persist edits to an active player while preserving the V003 supertype/subtype split.

Frontend use: `PUT /api/players/[playerId]` from `/players/[playerId]/edit`.

Source: NEW BACKEND WRITE

SQL:

```sql
UPDATE person
SET first_name = :firstName,
    last_name = :lastName,
    dob = TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
    present_address = address_type(
      :presentAddress, :presentUpazila, :presentDistrict, :presentDivision
    ),
    permanent_address = address_type(
      :permanentAddress, :permanentUpazila,
      :permanentDistrict, :permanentDivision
    )
WHERE person_id = :playerId AND is_deleted = 0;

UPDATE player
SET player_role = :playerRole,
    gender = :gender,
    family_background = :familyBackground
WHERE person_id = :playerId AND is_deleted = 0;
```

Bind variables: `playerId` and the same validated player fields documented for creation.

How it works: Exactly one active PERSON and PLAYER must be updated before collection replacement proceeds.

Expected result/change: One PERSON and one PLAYER updated. All detail/collection/audit statements commit together or roll back together.

### Soft-delete a player

Purpose: Remove a player from active application views without hard-deleting historical records.

Frontend use: `DELETE /api/players/[playerId]` from the existing edit workflow.

Source: NEW BACKEND WRITE following V003 soft-delete behavior.

SQL:

```sql
UPDATE player SET is_deleted = 1
WHERE person_id = :playerId AND is_deleted = 0;

UPDATE person SET is_deleted = 1
WHERE person_id = :playerId AND is_deleted = 0;

UPDATE person_phone SET is_deleted = 1 WHERE person_id = :playerId;
UPDATE player_education SET is_deleted = 1 WHERE person_id = :playerId;
UPDATE player_achievement SET is_deleted = 1 WHERE person_id = :playerId;

UPDATE user_account
SET account_status = 'DISABLED', is_deleted = 1
WHERE person_id = :playerId AND is_deleted = 0;
```

Bind variables: `playerId`.

How it works: Core identity, form-managed child values, and any login are deactivated; team, career, match, and integrity history remains intact.

Expected result/change: One active player/person deactivated plus related active profile/account rows. All statements and the audit row commit together or roll back together.

### Player write audit row

Purpose: Record the actor and operation for each successful player create, update, or soft delete.

Frontend use: Every player write transaction.

Source: NEW BACKEND WRITE using V003 `AUDIT_LOG`.

SQL:

```sql
INSERT INTO audit_log (
  actor_person_id, entity_name, record_identifier, operation, new_values
) VALUES (
  :actorPersonId, 'PLAYER', :recordIdentifier, :operation, :newValues
);
```

Bind variables: Authenticated `actorPersonId`, player `recordIdentifier`, fixed-whitelist `operation`, and server-generated JSON `newValues` containing non-secret changed-field context.

How it works: Audit attribution comes from the signed server session, never client input.

Expected result/change: One audit row per successful write. It commits or rolls back with its player transaction.

## Teams

### Team registry count

Purpose: Count active teams after search and ownership filtering.

Frontend use: Team registry pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM team t
WHERE t.is_deleted = 0
  -- Optional bound name/id/category search
  -- Optional franchise_owner IS NULL / IS NOT NULL ownership condition
```

Bind variables: Optional `search`; ownership is a validated choice that selects a fixed null/not-null clause.

How it works: Only active teams matching the server-defined optional clauses are counted.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated team registry

Purpose: Return active teams with current-roster and recorded-match counts.

Frontend use: `/teams` table, search, ownership filter, sort, and pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT t.team_id, t.team_name, t.category, t.franchise_owner,
       (SELECT COUNT(DISTINCT pf.person_id)
          FROM plays_for pf
         WHERE pf.team_id = t.team_id
           AND pf.end_date IS NULL
           AND pf.is_deleted = 0) AS roster_count,
       (SELECT COUNT(DISTINCT i.match_id)
          FROM includes i
          JOIN match m ON m.match_id = i.match_id AND m.is_deleted = 0
         WHERE i.team_id = t.team_id AND i.is_deleted = 0) AS match_count
FROM team t
WHERE t.is_deleted = 0
  -- Optional documented search/ownership clauses
ORDER BY /* one server-whitelisted expression: name, id, or category */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional `search`; required `rowOffset` and `rowLimit`.

How it works: Oracle calculates relationship counts and performs filtering, fixed-whitelist sorting, and pagination before returning rows.

Expected result/change: Zero or more team list rows. Read-only; no transaction changes.

### Team detail heading

Purpose: Load one active team and its roster/match counts.

Frontend use: `/teams/[teamId]` header and overview.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT t.team_id, t.team_name, t.category, t.franchise_owner,
       (SELECT COUNT(DISTINCT pf.person_id)
          FROM plays_for pf
         WHERE pf.team_id = t.team_id AND pf.end_date IS NULL AND pf.is_deleted = 0) AS roster_count,
       (SELECT COUNT(DISTINCT i.match_id)
          FROM includes i
          JOIN match m ON m.match_id = i.match_id AND m.is_deleted = 0
         WHERE i.team_id = t.team_id AND i.is_deleted = 0) AS match_count
FROM team t
WHERE t.team_id = :teamId AND t.is_deleted = 0;
```

Bind variables: `teamId`.

How it works: The team is selected by its validated numeric reference and relation counts are computed from active junction rows.

Expected result/change: One active team or no row. Read-only; no transaction changes.

### Current team roster

Purpose: Load the active players currently associated with one team.

Frontend use: Team detail Roster tab.

Source: Adapted from V003 catalogue query `P06_current_team_roster.sql`; the API projects the identity, role, and gender columns required by this page.

SQL:

```sql
SELECT p.person_id, p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender
FROM plays_for pf
JOIN player pl ON pl.person_id = pf.person_id AND pl.is_deleted = 0
JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
WHERE pf.team_id = :teamId
  AND pf.end_date IS NULL
  AND pf.is_deleted = 0
ORDER BY pl.player_role, p.last_name, p.first_name, p.person_id;
```

Bind variables: `teamId`.

How it works: `PLAYS_FOR` supplies the player-team relationship; an open-ended active association identifies the current roster.

Expected result/change: Zero or more roster rows. Read-only; no transaction changes.

### Team competition matches

Purpose: Load active matches and tournaments in which one team participates.

Frontend use: Team detail Competition Matches tab.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT m.match_id, tr.tournament_id, tr.tournament_name,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue
FROM includes selected_team
JOIN match m ON m.match_id = selected_team.match_id AND m.is_deleted = 0
JOIN tournament tr ON tr.tournament_id = m.tournament_id AND tr.is_deleted = 0
WHERE selected_team.team_id = :teamId AND selected_team.is_deleted = 0
ORDER BY m.match_date DESC, m.match_id DESC;
```

Bind variables: `teamId`.

How it works: `INCLUDES` identifies the matches containing the requested team, then joins each active tournament edition.

Expected result/change: Zero or more match rows. Read-only; no transaction changes.

### Participating teams for team matches

Purpose: Load every active participant for the selected team's matches so the UI can identify opponents.

Frontend use: Opponent column in the Team detail Competition Matches tab.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT i.match_id, t.team_id, t.team_name, t.category, t.franchise_owner
FROM includes i
JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
WHERE i.is_deleted = 0
  AND EXISTS (
    SELECT 1
    FROM includes selected_team
    WHERE selected_team.match_id = i.match_id
      AND selected_team.team_id = :teamId
      AND selected_team.is_deleted = 0
  )
ORDER BY i.match_id, t.team_name, t.team_id;
```

Bind variables: `teamId`.

How it works: The correlated existence test restricts participants to matches linked to the requested team; the server groups rows by match ID.

Expected result/change: Zero or more match-participant rows. Read-only; no transaction changes.

## Tournaments

### Tournament registry count

Purpose: Count active tournament editions after name/ID/season search and tier filtering.

Frontend use: Tournament registry pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM tournament tr
WHERE tr.is_deleted = 0
  -- Optional bound name/id/season search
  -- Optional bound tier contains filter
```

Bind variables: Optional `search` and `tier`.

How it works: Only active tournament editions matching validated optional filters are counted.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated tournament registry

Purpose: Return active tournament editions with sponsor, participant-team, and match counts.

Frontend use: `/tournaments` table, search, tier filter, sort, and pagination.

Source: Combines the sponsor-coverage concept from V003 catalogue query `T06_sponsor_coverage.sql` with edition relationship counts.

SQL:

```sql
SELECT tr.tournament_id, tr.tournament_name,
       tr.tournament_tier_level, tr.season_year,
       (SELECT COUNT(*) FROM tournament_sponsor ts
         WHERE ts.tournament_id = tr.tournament_id AND ts.is_deleted = 0) AS sponsor_count,
       (SELECT COUNT(DISTINCT i.team_id)
          FROM match m
          JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
         WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS team_count,
       (SELECT COUNT(*) FROM match m
         WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS match_count
FROM tournament tr
WHERE tr.is_deleted = 0
  -- Optional documented search/tier clauses
ORDER BY /* one server-whitelisted expression: name, id, or season */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional `search`, `tier`; required `rowOffset` and `rowLimit`.

How it works: The edition remains the root record and Oracle computes counts through active sponsor, match, and participant junction rows.

Expected result/change: Zero or more tournament rows. Read-only; no transaction changes.

### Tournament detail heading

Purpose: Load one active tournament edition and its relationship counts.

Frontend use: `/tournaments/[tournamentId]` header and overview.

Source: NEW BACKEND QUERY; same projections as the registry query with an exact key predicate.

SQL:

```sql
SELECT tr.tournament_id, tr.tournament_name,
       tr.tournament_tier_level, tr.season_year,
       /* active sponsor, distinct participant-team, and match count subqueries */
FROM tournament tr
WHERE tr.tournament_id = :tournamentId AND tr.is_deleted = 0;
```

Bind variables: `tournamentId`.

How it works: A validated edition key selects the active tournament and related counts.

Expected result/change: One active tournament or no row. Read-only; no transaction changes.

### Tournament sponsors

Purpose: Load all active sponsors for one tournament edition.

Frontend use: Tournament detail Sponsors tab.

Source: Detail form of V003 catalogue query `T06_sponsor_coverage.sql`.

SQL:

```sql
SELECT sponsor AS value
FROM tournament_sponsor
WHERE tournament_id = :tournamentId AND is_deleted = 0
ORDER BY sponsor;
```

Bind variables: `tournamentId`.

How it works: Sponsor values are selected from their multivalued edition relation in deterministic order.

Expected result/change: Zero or more sponsor rows. Read-only; no transaction changes.

### Tournament participating teams

Purpose: Load distinct active teams participating in an edition's matches.

Frontend use: Tournament detail Participating Teams tab.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT DISTINCT t.team_id, t.team_name, t.category, t.franchise_owner
FROM match m
JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
ORDER BY t.team_name, t.team_id;
```

Bind variables: `tournamentId`.

How it works: Participation is derived through `MATCH` and `INCLUDES`; no unsupported direct tournament-team record is invented.

Expected result/change: Zero or more distinct team rows. Read-only; no transaction changes.

### Tournament matches

Purpose: Load match headings for one tournament edition.

Frontend use: Tournament detail Matches tab.

Source: Detail projection adapted from V003 catalogue query `T01_edition_fixture_and_results.sql`.

SQL:

```sql
SELECT m.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
       m.venue, m.match_format, m.match_status, m.result, m.winner_team_id
FROM match m
WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
ORDER BY m.match_date, m.match_id;
```

Bind variables: `tournamentId`.

How it works: The physical V003 match presentation fields are returned as optional detail data while the edition/date/venue/teams remain the core UI model.

Expected result/change: Zero or more match rows. Read-only; no transaction changes.

### Tournament match participants

Purpose: Load the active team participants for every match in an edition.

Frontend use: Teams column in the Tournament detail Matches tab.

Source: Participant portion of V003 catalogue query `T01_edition_fixture_and_results.sql`.

SQL:

```sql
SELECT i.match_id, t.team_id, t.team_name, t.category, t.franchise_owner
FROM match m
JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
ORDER BY i.match_id, t.team_id;
```

Bind variables: `tournamentId`.

How it works: Participant rows are fetched once and grouped by match ID in the server response.

Expected result/change: Zero or more match-team rows. Read-only; no transaction changes.

## Matches

### Match registry count

Purpose: Count active matches after match/team/venue search, tournament, and exact-date filters.

Frontend use: Match registry pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM match m
JOIN tournament tr ON tr.tournament_id = m.tournament_id
WHERE m.is_deleted = 0 AND tr.is_deleted = 0
  -- Optional bound match ID, venue, tournament, or participant-team search
  -- Optional bound tournament name/ID filter
  -- Optional TRUNC(m.match_date) = TO_DATE(:matchDate, 'YYYY-MM-DD')
```

Bind variables: Optional `search`, `tournament`, `tournamentExact`, and `matchDate`.

How it works: Active matches are counted after the API selects only validated optional clauses.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated match registry

Purpose: Return active fixtures/results with tournament and participant names.

Frontend use: `/matches` table, filters, sort, and pagination.

Source: Adapted from V003 catalogue query `T01_edition_fixture_and_results.sql`.

SQL:

```sql
SELECT m.match_id, tr.tournament_id, tr.tournament_name,
       (SELECT LISTAGG(t.team_name, ' vs ') WITHIN GROUP (ORDER BY t.team_id)
          FROM includes i
          JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
         WHERE i.match_id = m.match_id AND i.is_deleted = 0) AS participating_teams,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
       m.venue, m.match_format, m.match_status
FROM match m
JOIN tournament tr ON tr.tournament_id = m.tournament_id
WHERE m.is_deleted = 0 AND tr.is_deleted = 0
  -- Optional documented filters
ORDER BY /* one server-whitelisted expression: date, id, or tournament */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional registry-filter binds; required `rowOffset` and `rowLimit`.

How it works: Oracle performs filtering/pagination and a correlated `LISTAGG` supplies the participant display without duplicating match rows.

Expected result/change: Zero or more match rows. Read-only; no transaction changes.

### Match detail heading

Purpose: Load one active match and its tournament/outcome fields.

Frontend use: `/matches/[matchId]` header and overview.

Source: Detail form of V003 catalogue query `T01_edition_fixture_and_results.sql`.

SQL:

```sql
SELECT m.match_id, tr.tournament_id, tr.tournament_name,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
       m.venue, m.match_format, m.match_status, m.result, m.winner_team_id
FROM match m
JOIN tournament tr ON tr.tournament_id = m.tournament_id AND tr.is_deleted = 0
WHERE m.match_id = :matchId AND m.is_deleted = 0;
```

Bind variables: `matchId`.

How it works: A validated numeric match reference selects the match and active tournament edition.

Expected result/change: One active match or no row. Read-only; no transaction changes.

### Match participants

Purpose: Load active participating teams for one match.

Frontend use: Match header and Participating Teams section.

Source: Participant portion of V003 catalogue query `T01_edition_fixture_and_results.sql`.

SQL:

```sql
SELECT t.team_id, t.team_name, t.category, t.franchise_owner
FROM includes i
JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
WHERE i.match_id = :matchId AND i.is_deleted = 0
ORDER BY t.team_id;
```

Bind variables: `matchId`.

How it works: The physical `INCLUDES` relation powers the match's participant UI.

Expected result/change: Zero or more team rows. Read-only; no transaction changes.

### Match batting scorecard

Purpose: Resolve batting-performance rows to their players for one match.

Frontend use: Match detail Batting tab.

Source: Uses the same performance-to-summary-to-career chain as V003 `P03_match_by_match_tournament_scorecard.sql`.

SQL:

```sql
SELECT bp.bat_stat_id AS performance_id, p.person_id,
       p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender, bp.runs_scored, bp.balls_faced,
       bp.strike_rate, bp.dismissal_type
FROM batting_performance bp
JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id AND bs.is_deleted = 0
JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0
JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
WHERE bp.match_id = :matchId AND bp.is_deleted = 0
ORDER BY bp.runs_scored DESC, p.person_id;
```

Bind variables: `matchId`.

How it works: V003 summary and career foreign keys resolve each stat row to its active player.

Expected result/change: Zero or more batting rows. Read-only; no transaction changes.

### Match bowling scorecard

Purpose: Resolve bowling-performance rows to their players for one match.

Frontend use: Match detail Bowling tab.

Source: Uses the V003 performance-to-summary-to-career relationship.

SQL:

```sql
SELECT bp.bowl_stat_id AS performance_id, p.person_id,
       p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender, bp.wickets_taken, bp.balls_bowled,
       bp.runs_conceded, bp.economy_rate
FROM bowling_performance bp
JOIN bowling_summary bs ON bs.bowl_summary_id = bp.bowl_summary_id AND bs.is_deleted = 0
JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0
JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
WHERE bp.match_id = :matchId AND bp.is_deleted = 0
ORDER BY bp.wickets_taken DESC, p.person_id;
```

Bind variables: `matchId`.

How it works: The server formats `balls_bowled` into cricket overs after resolving active player identity.

Expected result/change: Zero or more bowling rows. Read-only; no transaction changes.

### Match fielding scorecard

Purpose: Resolve fielding-performance rows to their players for one match.

Frontend use: Match detail Fielding tab.

Source: Uses the V003 performance-to-summary-to-career relationship.

SQL:

```sql
SELECT fp.field_stat_id AS performance_id, p.person_id,
       p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender, fp.catches, fp.stumpings,
       fp.runs_out_direct, fp.byes_conceded
FROM fielding_performance fp
JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id AND fs.is_deleted = 0
JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0
JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0
JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
WHERE fp.match_id = :matchId AND fp.is_deleted = 0
ORDER BY fp.catches DESC, p.person_id;
```

Bind variables: `matchId`.

How it works: The V003 foreign-key chain resolves the stat row to a player without duplicating stored identity data.

Expected result/change: Zero or more fielding rows. Read-only; no transaction changes.

### Match administrative observations

Purpose: Load administrator observations and both participant names for one match.

Frontend use: Match detail Administrative Observations tab.

Source: Detail form of V003 administration query concepts around `OBSERVES` (including `A08`/`A09`).

SQL:

```sql
SELECT o.admin_id, ap.first_name || ' ' || ap.last_name AS admin_name,
       o.player_id, pp.first_name || ' ' || pp.last_name AS player_name,
       TO_CHAR(o.observation_date, 'YYYY-MM-DD') AS observation_date,
       o.remarks
FROM observes o
JOIN person ap ON ap.person_id = o.admin_id AND ap.is_deleted = 0
JOIN person pp ON pp.person_id = o.player_id AND pp.is_deleted = 0
WHERE o.match_id = :matchId AND o.is_deleted = 0
ORDER BY o.observation_date DESC, o.admin_id, o.player_id;
```

Bind variables: `matchId`.

How it works: Both administrator and player PERSON rows are joined with separate aliases to present readable observation attribution.

Expected result/change: Zero or more observation rows. Read-only; no transaction changes.

## Performance / Career

The performance detail endpoint reuses all documented Player profile identity, relationship, career, and summary queries before adding the match-level statements below.

### Performance registry count

Purpose: Count active players after player, career tier, and summary-format filters.

Frontend use: Performance registry pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM person p
JOIN player pl ON pl.person_id = p.person_id
WHERE p.is_deleted = 0 AND pl.is_deleted = 0
  -- Optional bound player name/ID search
  -- Optional EXISTS active CAREER_RECORD matching :tier
  -- Optional EXISTS active batting/bowling/fielding summary matching :matchFormat
```

Bind variables: Optional `search`, `tier`, and `matchFormat`.

How it works: `EXISTS` filters constrain players without multiplying result rows across career and summary relations.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated performance registry

Purpose: Return one row per active player with career coverage and aggregate counts.

Frontend use: `/performance/players` table, filters, server-side sort, and pagination.

Source: NEW BACKEND QUERY using V003 career/summary relations.

SQL:

```sql
SELECT p.person_id, p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender,
       (SELECT COUNT(*) FROM career_record cr
         WHERE cr.person_id = p.person_id AND cr.is_deleted = 0) AS career_record_count,
       (SELECT NVL(SUM(cr.matches_played), 0) FROM career_record cr
         WHERE cr.person_id = p.person_id AND cr.is_deleted = 0) AS matches_played,
       (SELECT COUNT(*) FROM batting_summary bs JOIN career_record cr
          ON cr.record_id = bs.record_id AND cr.is_deleted = 0
         WHERE cr.person_id = p.person_id AND bs.is_deleted = 0) AS batting_summary_count,
       (SELECT COUNT(*) FROM bowling_summary bs JOIN career_record cr
          ON cr.record_id = bs.record_id AND cr.is_deleted = 0
         WHERE cr.person_id = p.person_id AND bs.is_deleted = 0) AS bowling_summary_count,
       (SELECT COUNT(*) FROM fielding_summary fs JOIN career_record cr
          ON cr.record_id = fs.record_id AND cr.is_deleted = 0
         WHERE cr.person_id = p.person_id AND fs.is_deleted = 0) AS fielding_summary_count
FROM person p
JOIN player pl ON pl.person_id = p.person_id
WHERE p.is_deleted = 0 AND pl.is_deleted = 0
  -- Optional documented filters
ORDER BY /* one server-whitelisted expression: name, matches, or id */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional registry-filter binds; required `rowOffset` and `rowLimit`.

How it works: Correlated subqueries calculate each metric independently while preserving exactly one player row.

Expected result/change: Zero or more player-performance rows. Read-only; no transaction changes.

### Player match batting performance

Purpose: Load a player's active match-level batting history.

Frontend use: Player performance Batting tab.

Source: Player-scoped form of V003 catalogue query `P03_match_by_match_tournament_scorecard.sql`.

SQL:

```sql
SELECT bp.bat_stat_id AS performance_id, m.match_id,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue,
       bp.runs_scored, bp.balls_faced, bp.strike_rate, bp.dismissal_type
FROM career_record cr
JOIN batting_summary bs ON bs.record_id = cr.record_id AND bs.is_deleted = 0
JOIN batting_performance bp ON bp.bat_summary_id = bs.bat_summary_id AND bp.is_deleted = 0
JOIN match m ON m.match_id = bp.match_id AND m.is_deleted = 0
WHERE cr.person_id = :playerId AND cr.is_deleted = 0
ORDER BY m.match_date DESC, m.match_id DESC;
```

Bind variables: `playerId`.

How it works: The V003 career-summary-performance chain resolves all active batting transactions for the selected player.

Expected result/change: Zero or more batting performances. Read-only; no transaction changes.

### Player match bowling performance

Purpose: Load a player's active match-level bowling history.

Frontend use: Player performance Bowling tab.

Source: Player-scoped form of V003 catalogue query `P03_match_by_match_tournament_scorecard.sql`.

SQL:

```sql
SELECT bp.bowl_stat_id AS performance_id, m.match_id,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue,
       bp.wickets_taken, bp.balls_bowled, bp.runs_conceded, bp.economy_rate
FROM career_record cr
JOIN bowling_summary bs ON bs.record_id = cr.record_id AND bs.is_deleted = 0
JOIN bowling_performance bp ON bp.bowl_summary_id = bs.bowl_summary_id AND bp.is_deleted = 0
JOIN match m ON m.match_id = bp.match_id AND m.is_deleted = 0
WHERE cr.person_id = :playerId AND cr.is_deleted = 0
ORDER BY m.match_date DESC, m.match_id DESC;
```

Bind variables: `playerId`.

How it works: The API resolves bowling transactions to the player and converts balls into cricket-over notation.

Expected result/change: Zero or more bowling performances. Read-only; no transaction changes.

### Player match fielding performance

Purpose: Load a player's active match-level fielding history.

Frontend use: Player performance Fielding tab.

Source: Player-scoped form of V003 catalogue query `P03_match_by_match_tournament_scorecard.sql`.

SQL:

```sql
SELECT fp.field_stat_id AS performance_id, m.match_id,
       TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue,
       fp.catches, fp.stumpings, fp.runs_out_direct, fp.byes_conceded
FROM career_record cr
JOIN fielding_summary fs ON fs.record_id = cr.record_id AND fs.is_deleted = 0
JOIN fielding_performance fp ON fp.field_summary_id = fs.field_summary_id AND fp.is_deleted = 0
JOIN match m ON m.match_id = fp.match_id AND m.is_deleted = 0
WHERE cr.person_id = :playerId AND cr.is_deleted = 0
ORDER BY m.match_date DESC, m.match_id DESC;
```

Bind variables: `playerId`.

How it works: The V003 career-summary-performance chain resolves all active fielding transactions for the selected player.

Expected result/change: Zero or more fielding performances. Read-only; no transaction changes.

## Integrity

### Complaint registry count

Purpose: Count active complaints after text, source, and received-date filters.

Frontend use: Complaint registry pagination.

Source: Count companion to V003 catalogue query `Q11_list_complaints.sql`.

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM complaint c
WHERE c.is_deleted = 0
  -- Optional bound complaint ID/description/misconduct search
  -- Optional bound source-type contains filter
  -- Optional received-from and received-to date bounds
```

Bind variables: Optional `search`, `source`, `fromDate`, and `toDate`.

How it works: The API validates ISO dates and rejects inverted ranges before Oracle applies the bound filters.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated complaint registry

Purpose: Return active complaints and their active linked-case counts.

Frontend use: `/integrity/complaints` table, filters, sort, and pagination.

Source: Extends V003 catalogue query `Q11_list_complaints.sql` with case-source counts and pagination.

SQL:

```sql
SELECT c.complaint_id, c.source_type,
       TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received,
       c.description, c.misconduct_type,
       (SELECT COUNT(*)
          FROM source_of s
          JOIN case_record cr ON cr.case_id = s.case_id AND cr.is_deleted = 0
         WHERE s.complaint_id = c.complaint_id AND s.is_deleted = 0) AS linked_case_count
FROM complaint c
WHERE c.is_deleted = 0
  -- Optional documented filters
ORDER BY /* one server-whitelisted expression: received, id, or source */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional registry-filter binds; required `rowOffset` and `rowLimit`.

How it works: The supported `SOURCE_OF` relation supplies linked-case coverage while preserving one row per complaint.

Expected result/change: Zero or more complaint rows. Read-only; no transaction changes.

### Complaint detail with cases

Purpose: Load one complaint and every active case for which it is a source.

Frontend use: `/integrity/complaints/[complaintId]` description and Linked Cases section.

Source: V003 catalogue query `Q12_complaint_details_with_case.sql` with API date formatting.

SQL:

```sql
SELECT c.complaint_id, c.source_type,
       TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received,
       c.misconduct_type, c.description, cr.case_id,
       cr.status AS case_status,
       TO_CHAR(cr.date_opened, 'YYYY-MM-DD') AS date_opened,
       cr.referral_status
FROM complaint c
LEFT JOIN source_of s
       ON s.complaint_id = c.complaint_id AND s.is_deleted = 0
LEFT JOIN case_record cr
       ON cr.case_id = s.case_id AND cr.is_deleted = 0
WHERE c.complaint_id = :complaintId AND c.is_deleted = 0
ORDER BY cr.date_opened, cr.case_id;
```

Bind variables: `complaintId`.

How it works: Left joins retain a complaint that has no case yet; the server groups repeated complaint columns into one response with linked cases.

Expected result/change: One or more rows for an active complaint, or no rows. Read-only; no transaction changes.

### Integrity case registry count

Purpose: Count active cases after reference/authority/type search, status, and opened-date filters.

Frontend use: Integrity case registry pagination.

Source: Count companion to V003 catalogue queries `Q01_unresolved_cases.sql` and `Q10_full_case_dossier.sql`.

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM case_record c
WHERE c.is_deleted = 0
  -- Optional bound case ID/authority/involvement-type search
  -- Optional bound status and exact opened-date filters
```

Bind variables: Optional `search`, `caseStatus`, and `openedDate`.

How it works: Validated filters are applied to all active cases, not only unresolved cases, because the registry also presents closed history.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated integrity case registry

Purpose: Return active cases with counts for each meaningful dossier relationship.

Frontend use: `/integrity/cases` table, filters, sort, and pagination.

Source: Paginated registry form of V003 catalogue query `Q10_full_case_dossier.sql`.

SQL:

```sql
SELECT c.case_id, c.status,
       TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened,
       c.referral_status,
       (SELECT COUNT(*) FROM source_of s
         WHERE s.case_id = c.case_id AND s.is_deleted = 0) AS complaint_count,
       (SELECT COUNT(*) FROM involves_in ii
         WHERE ii.case_id = c.case_id AND ii.is_deleted = 0) AS involved_player_count,
       (SELECT COUNT(DISTINCT i.admin_id) FROM investigates i
         WHERE i.case_id = c.case_id AND i.is_deleted = 0) AS investigator_count,
       (SELECT COUNT(*) FROM violates v
         WHERE v.case_id = c.case_id AND v.is_deleted = 0) AS rule_count,
       (SELECT COUNT(*) FROM evidence e
         WHERE e.case_id = c.case_id AND e.is_deleted = 0) AS evidence_count
FROM case_record c
WHERE c.is_deleted = 0
  -- Optional documented filters
ORDER BY /* one server-whitelisted expression: opened, id, or status */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional registry-filter binds; required `rowOffset` and `rowLimit`.

How it works: Correlated counts consolidate junction relations inside the case registry rather than exposing junction tables as separate modules.

Expected result/change: Zero or more case rows. Read-only; no transaction changes.

### Integrity case dossier heading

Purpose: Load one active case, referral data, and relationship counts.

Frontend use: `/integrity/cases/[caseId]` header and overview.

Source: V003 catalogue query `Q10_full_case_dossier.sql`, with distinct investigator count and formatted date.

SQL:

```sql
SELECT c.case_id, c.status, c.involvement_type,
       TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened,
       c.referral_status, c.referred_to_authority,
       /* complaint, involved-player, distinct-investigator, rule, evidence counts */
FROM case_record c
WHERE c.case_id = :caseId AND c.is_deleted = 0;
```

Bind variables: `caseId`.

How it works: The case heading is selected once and the response presents physical involvement information on each player-case UI relationship.

Expected result/change: One active case or no row. Read-only; no transaction changes.

### Case involved players and investigation team

Purpose: Load involved players and their assigned investigators for one case.

Frontend use: Involved Players and Investigation Team tabs.

Source: Extends V003 catalogue query `Q03_players_in_case.sql` with investigator identity and administration fields.

SQL:

```sql
SELECT p.person_id AS player_id,
       p.first_name || ' ' || p.last_name AS full_name,
       pl.player_role, pl.gender, c.involvement_type,
       inv.admin_id AS investigator_id,
       ap.first_name || ' ' || ap.last_name AS investigator_name,
       a.designation, a.department
FROM involves_in ii
JOIN case_record c ON c.case_id = ii.case_id AND c.is_deleted = 0
JOIN player pl ON pl.person_id = ii.person_id AND pl.is_deleted = 0
JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
LEFT JOIN investigates inv
       ON inv.person_id = ii.person_id AND inv.case_id = ii.case_id AND inv.is_deleted = 0
LEFT JOIN admin a ON a.person_id = inv.admin_id AND a.is_deleted = 0
LEFT JOIN person ap ON ap.person_id = a.person_id AND ap.is_deleted = 0
WHERE ii.case_id = :caseId AND ii.is_deleted = 0
ORDER BY p.last_name, p.first_name, p.person_id;
```

Bind variables: `caseId`.

How it works: `INVOLVES_IN` remains the player-case relationship and `INVESTIGATES` supplies its assignment; the server groups rows into player assignments and a unified investigation team.

Expected result/change: Zero or more involvement/assignment rows. Read-only; no transaction changes.

### Case complaint sources

Purpose: Load complaints linked as sources of one case.

Frontend use: Integrity case Complaint Sources tab.

Source: Reverse-direction detail of V003 `Q12_complaint_details_with_case.sql`.

SQL:

```sql
SELECT c.complaint_id, c.source_type,
       TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received,
       c.description, c.misconduct_type
FROM source_of s
JOIN complaint c ON c.complaint_id = s.complaint_id AND c.is_deleted = 0
WHERE s.case_id = :caseId AND s.is_deleted = 0
ORDER BY c.date_received, c.complaint_id;
```

Bind variables: `caseId`.

How it works: Only the finalized `COMPLAINT`/`SOURCE_OF` case-source model is used.

Expected result/change: Zero or more complaint rows. Read-only; no transaction changes.

### Rules linked to a case

Purpose: Load all active rules allegedly violated in one case.

Frontend use: Integrity case Rules & Violations tab.

Source: V003 catalogue query `Q04_rules_for_case.sql`.

SQL:

```sql
SELECT r.rule_id, r.category, r.clause_no
FROM violates v
JOIN rulebook r ON r.rule_id = v.rule_id
WHERE v.case_id = :caseId AND v.is_deleted = 0 AND r.is_deleted = 0
ORDER BY r.category, r.clause_no;
```

Bind variables: `caseId`.

How it works: The active `VIOLATES` junction powers the embedded case rules section.

Expected result/change: Zero or more rule rows. Read-only; no transaction changes.

### Evidence for a case

Purpose: Load active evidence belonging to one case.

Frontend use: Integrity case Evidence tab.

Source: V003 catalogue query `Q05_evidence_for_case.sql`.

SQL:

```sql
SELECT evidence_no, description,
       TO_CHAR(collected_date, 'YYYY-MM-DD') AS collected_date
FROM evidence
WHERE case_id = :caseId AND is_deleted = 0
ORDER BY evidence_no;
```

Bind variables: `caseId`.

How it works: Evidence is identified within its owning case by the composite case/evidence key.

Expected result/change: Zero or more evidence rows. Read-only; no transaction changes.

## Rulebook

### Rulebook registry count

Purpose: Count active rules after reference/clause/category search and category filtering.

Frontend use: Rulebook registry pagination.

Source: NEW BACKEND QUERY

SQL:

```sql
SELECT COUNT(*) AS total_items
FROM rulebook r
WHERE r.is_deleted = 0
  -- Optional bound rule ID/clause/category search
  -- Optional bound category contains filter
```

Bind variables: Optional `search` and `category`.

How it works: Only active finalized rulebook records matching validated filters are counted.

Expected result/change: One count row. Read-only; no transaction changes.

### Paginated rulebook registry

Purpose: Return active rules and their active linked-case counts.

Frontend use: `/integrity/rulebook` table, filters, sort, and pagination.

Source: Reverse-direction companion to V003 catalogue query `Q04_rules_for_case.sql`.

SQL:

```sql
SELECT r.rule_id, r.clause_no, r.category,
       (SELECT COUNT(*)
          FROM violates v
          JOIN case_record c ON c.case_id = v.case_id AND c.is_deleted = 0
         WHERE v.rule_id = r.rule_id AND v.is_deleted = 0) AS linked_case_count
FROM rulebook r
WHERE r.is_deleted = 0
  -- Optional documented filters
ORDER BY /* one server-whitelisted expression: clause, id, or category */
OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY;
```

Bind variables: Optional registry-filter binds; required `rowOffset` and `rowLimit`.

How it works: The `VIOLATES` junction supplies case coverage without exposing a standalone junction-table module.

Expected result/change: Zero or more rule rows. Read-only; no transaction changes.

### Rulebook detail with linked cases

Purpose: Load one active rule and every active case linked through a violation.

Frontend use: `/integrity/rulebook/[ruleId]` heading and Linked Case Violations section.

Source: Reverse-direction detail of V003 catalogue query `Q04_rules_for_case.sql`.

SQL:

```sql
SELECT r.rule_id, r.clause_no, r.category, c.case_id, c.status,
       TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened,
       c.referral_status,
       CASE WHEN c.case_id IS NULL THEN 0 ELSE
         (SELECT COUNT(*) FROM involves_in ii
           WHERE ii.case_id = c.case_id AND ii.is_deleted = 0)
       END AS involved_player_count
FROM rulebook r
LEFT JOIN violates v ON v.rule_id = r.rule_id AND v.is_deleted = 0
LEFT JOIN case_record c ON c.case_id = v.case_id AND c.is_deleted = 0
WHERE r.rule_id = :ruleId AND r.is_deleted = 0
ORDER BY c.date_opened DESC, c.case_id DESC;
```

Bind variables: `ruleId`.

How it works: Left joins retain an unlinked rule; the server groups repeated rule columns into one response with linked cases.

Expected result/change: One or more rows for an active rule, or no rows. Read-only; no transaction changes.

## Administration / Audit

Queries will be added with authenticated writes and dashboard integration.

## Development / Verification Queries

- Listener preflight: Oracle 19c `LISTENER_PITCH` reported `pitchpdb` READY on port 1522.
- Service preflight: `OracleServicePITCHCDB` reported Running.
- SQL*Plus preflight: the health-context query returned `PITCHSYNC_OWNER` / `PITCHPDB`; `USER_TABLES` remained 32 and invalid objects remained 0.
