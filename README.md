# PitchSync

PitchSync is a Bangladesh cricket administration, performance, competition, and integrity-management platform built as an academic DBMS project. The application uses Next.js App Router route handlers, the official `oracledb` driver, and raw bind-variable SQL against Oracle Database 19c.

## Local requirements

- A current Node.js LTS release and npm
- The deployed V003 schema in `PITCHSYNC_OWNER`
- Oracle 19c available at `localhost:1522/PITCHPDB`

The separate Oracle XE service on port 1521 is not a PitchSync target and must remain untouched.

## Run locally

Install dependencies:

```bash
npm install
```

Create the ignored `.env.oracle-local` file in the project root with the existing schema-owner password:

```text
DB_PASSWORD=your-existing-PITCHSYNC_OWNER-password
```

Generate the ignored Next.js server environment file. This copies the password without printing it, fixes the approved Oracle target, and creates a random session secret:

```bash
npm run env:setup
```

For the local V003 seed accounts, activate their password hashes and refresh the ignored `DEMO_CREDENTIALS.txt` sign-in reference:

```bash
npm run auth:activate-local
```

Start the application:

```bash
npm run dev
```

Open `http://localhost:3000/sign-in` and use a matching username, password, and role from `DEMO_CREDENTIALS.txt`. Never commit either credentials file or any `.env` file.

## Production-style verification

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

Production deployments must supply `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`, and a strong `AUTH_SECRET` through server-side secret management. None of these values may use a `NEXT_PUBLIC_` prefix.

## Integrated application areas

- Database-backed authentication with an HttpOnly signed session cookie
- Server-side route and API authorization for all six approved roles
- Role-specific Oracle-backed dashboards
- Player registry, search, filters, pagination, profile, registration, update, and soft delete
- Team registry, filters, pagination, detail, roster, and match associations
- Tournament registry, filters, pagination, detail, teams, sponsors, and matches
- Match registry, filters, pagination, detail, performance scorecards, and observations
- Player career and performance registry, filters, pagination, and detail
- Complaint, integrity-case, and rulebook registries with search, filters, pagination, and details

Browser code never connects directly to Oracle. All business data passes through authenticated Next.js server APIs, and every user-controlled SQL value is sent as an Oracle bind variable.

## Key routes

| Area | Routes |
| --- | --- |
| Authentication | `/sign-in`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session` |
| Health | `/api/health/database` |
| Dashboards | `/super-admin/dashboard`, `/board-admin/dashboard`, `/performance/dashboard`, `/match-official/dashboard`, `/integrity/dashboard`, `/player/dashboard` |
| Players | `/players`, `/players/new`, `/players/[playerId]`, `/players/[playerId]/edit` |
| Teams | `/teams`, `/teams/[teamId]` |
| Tournaments | `/tournaments`, `/tournaments/[tournamentId]` |
| Matches | `/matches`, `/matches/[matchId]` |
| Performance | `/performance/players`, `/performance/players/[playerId]` |
| Integrity | `/integrity/complaints`, `/integrity/cases`, `/integrity/rulebook` and their detail routes |

## Database and query documentation

- `database/migrations/V003_create_final_schema.sql` is the authoritative physical schema.
- `database/BACKEND_QUERY_GUIDE.md` documents every backend query, bind, frontend mapping, and transaction behavior.
- `docs & assets/query_history.txt` records actual Oracle deployment and execution history without secrets.
- `database/README.md` documents the V003 deployment and verification process.

Normal backend development must not rerun V003's destructive reset logic. Use V003 soft-delete behavior for historical records and keep all credentials, wallets, dumps, and private keys outside Git.

## Repository structure

```text
PitchSync/
|-- src/app/                     # Next.js pages and server API routes
|-- src/features/                # Role and domain UI
|-- src/lib/db/                  # Server-only Oracle pool and query modules
|-- database/                    # V003 schema, SQL catalogue, tests, and guide
|-- docs & assets/               # ER/schema references and execution history
|-- scripts/                     # Local environment/account setup helpers
`-- package.json
```

## License

This repository is maintained for academic and educational purposes.
