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

Queries will be added with the authentication checkpoint.

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

Queries will be added with the tournament integration checkpoint.

## Matches

Queries will be added with the match integration checkpoint.

## Performance / Career

Queries will be added with the performance integration checkpoint.

## Integrity

Queries will be added with the integrity integration checkpoint.

## Rulebook

Queries will be added with the integrity integration checkpoint.

## Administration / Audit

Queries will be added with authenticated writes and dashboard integration.

## Development / Verification Queries

- Listener preflight: Oracle 19c `LISTENER_PITCH` reported `pitchpdb` READY on port 1522.
- Service preflight: `OracleServicePITCHCDB` reported Running.
- SQL*Plus preflight: the health-context query returned `PITCHSYNC_OWNER` / `PITCHPDB`; `USER_TABLES` remained 32 and invalid objects remained 0.
