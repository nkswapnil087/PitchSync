# PitchSync query catalogue (V003)

The admin, player, tournament, and integrity read-only Oracle SQL queries use
`V003_create_final_schema.sql` as their schema and `v003_demo_data.sql` for
demonstration values. Run the V003 migration and seed before using the catalogue.

Bind variables are written as `:variable_name`. In SQL Developer, enter a value
when prompted. The header of each file gives values that return rows from the
V003 demo data; callers can supply any valid value.

## Query groups

| Folder | Files | Perspective |
| --- | ---: | --- |
| `player/` | P01-P09 | Career, match performance, selection, fitness, and mentorship |
| `tournament/` | T01-T09 | Edition reports, standings, leaders, venues, sponsors, and data quality |
| `admin/` | A01-A10 | Accounts, availability, scheduling, oversight, audits, and soft deletes |
| `integrity/` | Q01-Q15 | Complaints, cases, investigations, evidence, and rules |

The catalogue demonstrates core DBMS topics: inner and outer joins, aggregate
functions, `GROUP BY`, `HAVING`, subqueries, correlated subqueries, `EXISTS`,
`NOT EXISTS`, set operations, conditional aggregation, and common table
expressions.

## V003 modelling boundary

V003 stores a career record's `tier_level` and `location_type`, and stores each
match's format, tournament, edition year, venue, and participating teams. It does
not store opponent countries or identify a team as a national side. Therefore a
query such as "a player's Test record away against India" cannot include the
"against India" condition without changing the schema. `player/P02` provides the
schema-valid format-and-location report; it will also work for `TEST`/`Away` when
those records are added.

All current queries ignore soft-deleted rows unless their purpose is specifically
to audit soft-deleted data.
