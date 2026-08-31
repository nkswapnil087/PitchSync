# PitchSync V003 Database Update

## Outcome

The authoritative V003 database is deployed and verified on Oracle Database 19c as `PITCHSYNC_OWNER` in `PITCHPDB` at `localhost:1522`. The separate Oracle XE listener at `localhost:1521/XE` was not contacted or changed.

The owner schema was verified clean before deployment: 0 tables, 0 sequences, and 0 types. V003's destructive drop preamble was therefore skipped. The unchanged creation section was deployed directly.

## SQL inventory and classification

Fifty-five `.sql` files were found under `database/`:

- Current migration: `migrations/V003_create_final_schema.sql`
- Current seed: `seeds/v003_demo_data.sql`
- Current support: `indexes/create_indexes.sql`, `triggers/trg_person_dob_valid.sql`, `triggers/trg_investigates_admin_role.sql`
- Current verification: `tests/verify_v003_schema.sql`, `tests/run_v003_queries.sql`
- Current queries: admin A01-A10, player P01-P09, tournament T01-T09, integrity Q01-Q15 (43 files total)
- Historical migrations, not executed: `migrations/V001__create_final_schema.sql`, `migrations/V002__create_final_schema.sql`
- Historical seeds, not executed: `seeds/final_schema_demo_data.sql`, `seeds/v002_demo_data.sql`
- Setup example, not executed: `setup/create_local_user.example.sql`

`reference/PitchSync_DDL_Oracle.txt` was reviewed as non-migration reference material and is not a `.sql` file. V001 and V002 remain historical stages of the same design; V003 is the complete current physical implementation.

## Deployment files and order

1. V003 creation section, with its unnecessary clean-schema drop preamble skipped
2. `database/indexes/create_indexes.sql`
3. `database/triggers/trg_person_dob_valid.sql`
4. `database/triggers/trg_investigates_admin_role.sql`
5. `database/seeds/v003_demo_data.sql`, followed by `COMMIT`
6. `database/tests/verify_v003_schema.sql`
7. `database/tests/run_v003_queries.sql`

No frontend or backend source was changed and no Oracle driver, API, ORM, or backend connection module was added.

## Live schema verification

- Tables: 32
- Primary keys: 32/32 enabled and validated
- Foreign keys: 41/41 enabled and validated
- Unique constraints: 11/11 enabled and validated
- Oracle check/NOT NULL constraints: 138/138 enabled and validated
- Named business check constraints: 6
- Explicit sequences: 5 (`SEQ_ADMIN_PERSON`, `SEQ_CASE_RECORD`, `SEQ_COMPLAINT`, `SEQ_MATCH`, `SEQ_PLAYER_PERSON`)
- Object types: 2 (`ADDRESS_TYPE`, `EDUCATION_TYPE`)
- Explicit indexes: 15/15 valid
- Triggers: 2/2 enabled (`TRG_INVESTIGATES_ADMIN_ROLE`, `TRG_PERSON_DOB_VALID`)
- Invalid objects: 0

Enabled and validated foreign keys confirm that the committed seed rows satisfy the deployed FK relationships; no constraint was disabled to load the data.

## Committed seed rows

The audited V003 seed contains 226 inserts across 31 tables. `AUDIT_LOG` intentionally starts empty because it is populated by future runtime audit activity.

| Table | Rows | Table | Rows |
| --- | ---: | --- | ---: |
| ADMIN | 6 | AUDIT_LOG | 0 |
| BATTING_PERFORMANCE | 9 | BATTING_SUMMARY | 9 |
| BOWLING_PERFORMANCE | 6 | BOWLING_SUMMARY | 6 |
| CAREER_RECORD | 8 | CASE_RECORD | 6 |
| COMPLAINT | 6 | EVIDENCE | 8 |
| FIELDING_PERFORMANCE | 11 | FIELDING_SUMMARY | 11 |
| INCLUDES | 8 | INVESTIGATES | 8 |
| INVOLVES_IN | 9 | MATCH | 4 |
| MENTORS | 4 | OBSERVES | 6 |
| PERSON | 14 | PERSON_PHONE | 12 |
| PLAYER | 8 | PLAYER_ACHIEVEMENT | 6 |
| PLAYER_EDUCATION | 8 | PLAYER_FITNESS | 5 |
| PLAYS_FOR | 9 | RULEBOOK | 6 |
| SOURCE_OF | 4 | TEAM | 5 |
| TOURNAMENT | 2 | TOURNAMENT_SPONSOR | 4 |
| USER_ACCOUNT | 8 | VIOLATES | 10 |
| **Total** | **226** |  |  |

Seed application accounts are disabled and use an intentionally unusable credential marker. No real credential is stored in the seed or documentation.

## Live query results

All 43 current query files executed against the committed V003 seed with zero `ORA-`, `SP2-`, or `PLS-` errors. Zero rows is a valid result for the supplied filter, not an execution failure.

| Query | Rows | Purpose |
| --- | ---: | --- |
| A01 | 6 | Administrator directory and account status |
| A02 | 8 | Latest player availability |
| A03 | 3 | Players without fitness records |
| A04 | 2 | Upcoming-match roster availability |
| A05 | 7 | Administrative entity counts |
| A06 | 8 | Account health report |
| A07 | 0 | Audit activity in the supplied date range |
| A08 | 6 | Administrator observation workload |
| A09 | 6 | Performers without observations |
| A10 | 10 | Soft-deleted record summary |
| P01 | 1 | Player tournament-edition record |
| P02 | 1 | Player format/location career record |
| P03 | 1 | Match-by-match tournament scorecard |
| P04 | 2 | Above-team-average batters |
| P05 | 3 | Performance and fitness shortlist |
| P06 | 2 | Current team roster |
| P07 | 6 | Incomplete career summaries |
| P08 | 2 | Personal-best batting by tournament |
| P09 | 3 | Current mentorship pairs |
| T01 | 3 | Edition fixtures and results |
| T02 | 4 | Team results table |
| T03 | 6 | Leading run scorers |
| T04 | 4 | Leading wicket takers |
| T05 | 2 | Venue utilization |
| T06 | 2 | Sponsor coverage |
| T07 | 1 | Cross-edition summary |
| T08 | 0 | Completed matches missing statistics |
| T09 | 0 | Teams present in every match |
| Q01 | 5 | Unresolved cases |
| Q02 | 4 | Cases by investigator |
| Q03 | 2 | Players involved in a case |
| Q04 | 2 | Rules associated with a case |
| Q05 | 2 | Evidence associated with a case |
| Q06 | 1 | Unresolved cases without evidence |
| Q07 | 2 | Complaints without cases |
| Q08 | 2 | Frequently violated rules |
| Q09 | 2 | Investigator workload |
| Q10 | 1 | Full case dossier summary |
| Q11 | 6 | Complaint registry |
| Q12 | 1 | Complaint details and linked case |
| Q13 | 1 | Cases involving a player |
| Q14 | 1 | Involvements without an investigator |
| Q15 | 1 | Referred cases |

No empty or obsolete query file remains in the current A/P/T/Q catalogue.

## Execution issues and corrections

- The original command-embedded credential path returned `ORA-01017`; the Oracle 19c password-prompt path succeeded with the same confirmed credential. The password was never printed, persisted, or placed on the command line.
- V003 initially returned `ORA-01031` on `CREATE TYPE ADDRESS_TYPE`. A PDB administrator granted only the genuinely required `CREATE TYPE` privilege to `PITCHSYNC_OWNER`.
- The first resumed multiline deployment used SQL*Plus with `SQLBLANKLINES` off. It created only two types and five sequences before `SP2-0734` parsing errors at the first table. Those exact seven objects were removed, the clean checkpoint was reconfirmed, and the unchanged V003 creation section succeeded with `SQLBLANKLINES ON`.
- The verification row-count report returned `ORA-00904` for a UNION alias; the test query was wrapped in an outer SELECT.
- SQL*Plus rejected DATE declarations in the query runner (`SP2-0552`); the runner now uses session-formatted string binds for repeatable command-line validation.
- A05 and A10 returned `ORA-00904` for UNION ordering aliases and now use positional ordering.
- A07 returned `ORA-00932` during date arithmetic and now explicitly casts its range binds to DATE.
- SQL*Plus resolves the runner's nested includes from its process working directory in this environment. The documented test command runs from `database/tests`.

All failed attempts and their corrected executions are retained in `docs & assets/query_history.txt`. No unresolved V003 database issue remains.
