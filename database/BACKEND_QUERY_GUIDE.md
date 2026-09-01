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

Queries will be added with the player integration checkpoint.

## Teams

Queries will be added with the team integration checkpoint.

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
