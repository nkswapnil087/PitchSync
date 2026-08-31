# PitchSync Database

PitchSync targets Oracle Database 19c. The database history is evolutionary:

- `V001__create_final_schema.sql` is the original foundation and reference.
- `V002__create_final_schema.sql` is an intermediate historical version.
- `V003_create_final_schema.sql` is the current authoritative physical schema.

Fresh deployments use V003 directly. Do not run V001 and V002 first.

## Current V003 file set

```text
database/
|-- migrations/V003_create_final_schema.sql
|-- indexes/create_indexes.sql
|-- triggers/trg_person_dob_valid.sql
|-- triggers/trg_investigates_admin_role.sql
|-- seeds/v003_demo_data.sql
|-- tests/verify_v003_schema.sql
|-- tests/run_v003_queries.sql
`-- queries/
    |-- admin/A01-A10
    |-- player/P01-P09
    |-- tournament/T01-T09
    `-- integrity/Q01-Q15
```

The `reference/` directory and the V001/V002 migrations and seeds are historical material. They are not part of a V003 deployment.

## Local deployment target

The verified project environment uses a dedicated schema and PDB:

```text
Schema:  PITCHSYNC_OWNER
Host:    localhost
Port:    1522
Service: PITCHPDB
```

Confirm both values before changing anything:

```sql
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,
       SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
FROM dual;
```

Do not run these scripts against the separate Oracle XE listener on port 1521.

## Safe deployment order

1. Inspect `USER_TABLES`, `USER_SEQUENCES`, and `USER_TYPES`.
2. Confirm all existing objects are disposable PitchSync development objects, or confirm the schema is empty.
3. Run V003 while handling its development-only drop preamble safely. On a fresh schema, skip the unnecessary drop section.
4. Run `database/indexes/create_indexes.sql`.
5. Run both compatible triggers under `database/triggers/`.
6. Run `database/seeds/v003_demo_data.sql` and commit.
7. Run `database/tests/verify_v003_schema.sql`.
8. Run `database/tests/run_v003_queries.sql`.

V003 creates 32 tables, five explicit user-facing sequences, two object types, and identity-backed internal keys. Oracle also creates internal identity sequences and supporting indexes.

The schema owner needs `CREATE TYPE` in addition to the standard table, sequence, trigger, procedure, and view creation privileges. The local setup example includes this grant because V003 creates `ADDRESS_TYPE` and `EDUCATION_TYPE` before its tables.

## Seed data

`v003_demo_data.sql` is the only seed source for V003. It contains 226 inserts across 31 tables. `AUDIT_LOG` intentionally starts empty because runtime audit activity should populate it later.

Seed application accounts are disabled and use an unusable credential marker. They are not valid application credentials. Private contact information and statistics in the dataset are synthetic.

## Query catalogue

- Admin A01-A10: accounts, availability, record counts, observations, audit reporting, and soft deletion.
- Player P01-P09: tournament records, career summaries, performance, selection, rosters, and mentorship.
- Tournament T01-T09: fixtures, results, leaders, venues, sponsors, and completeness checks.
- Integrity Q01-Q15: complaints, cases, evidence, investigators, involved players, and rules.

Queries use bind variables such as `:player_id` and `:tournament_id`. `run_v003_queries.sql` supplies values from the V003 seed dataset for repeatable validation.

Run the test scripts with `database/tests` as SQL*Plus's working directory so the query runner's relative includes resolve correctly:

```sql
@verify_v003_schema.sql
@run_v003_queries.sql
```

## Verification and history

`verify_v003_schema.sql` reports the live target, table names/count, constraints and their columns, row counts, total rows, sequences, types, indexes, and trigger status using Oracle user metadata views.

Every live database change or failed execution attempt must be appended to:

```text
docs & assets/query_history.txt
```

Never place passwords, Oracle wallets, `.env` files, private keys, or privileged credentials in Git.
