# PitchSync

PitchSync is a Bangladesh cricket administration, performance, competition, and integrity-management platform created as an academic DBMS project. This repository contains the completed frontend, a prepared Express backend boundary, and Oracle database project files.

The frontend is a Next.js App Router application with 25 product routes, responsive role-based navigation, guarded dashboards, schema-aligned entity views, validated player forms, and typed data contracts. It does not fabricate business records and is intentionally disconnected from the backend during this frontend phase.

## Run the frontend

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No frontend environment variables are required.

For a production run:

```bash
npm run build
npm run start
```

## Sign in

The temporary client-side sign-in accepts any valid-looking email address, any non-empty password, and one selected role. The password is validated in the browser but is never stored. Available roles are:

- Super Administrator
- Cricket Board Administrator
- Team Performance Manager
- Match Official
- Integrity & Compliance Officer
- Player

The selected role is held in `sessionStorage` for the current browser session. Role selection exists only on the sign-in form, every role is routed directly to its own dashboard, cross-role routes are guarded, and signing out clears the session.

## Frontend routes

| Area | Routes |
| --- | --- |
| Authentication | `/sign-in` |
| Dashboards | `/super-admin/dashboard`, `/board-admin/dashboard`, `/performance/dashboard`, `/match-official/dashboard`, `/integrity/dashboard`, `/player/dashboard` |
| Players | `/players`, `/players/new`, `/players/[playerId]`, `/players/[playerId]/edit` |
| Teams | `/teams`, `/teams/[teamId]` |
| Tournaments | `/tournaments`, `/tournaments/[tournamentId]` |
| Matches | `/matches`, `/matches/[matchId]` |
| Performance | `/performance/players`, `/performance/players/[playerId]` |
| Complaints | `/integrity/complaints`, `/integrity/complaints/[complaintId]` |
| Cases | `/integrity/cases`, `/integrity/cases/[caseId]` |
| Rulebook | `/integrity/rulebook`, `/integrity/rulebook/[ruleId]` |

Dynamic routes render a valid empty detail view when no backend record is available. Deferred sidebar entries are visibly disabled and have no link or navigation behavior.

## Data model and boundaries

Frontend scope follows the final ER and relational schema. Relational concepts such as team membership, tournament participation, assigned investigators, persons involved, violated rules, evidence links, and complaint sources are presented within meaningful entity pages rather than as standalone junction-table screens.

Typed data contracts are defined in `src/data/contracts`. The current adapter in `src/data/adapters/unavailable` returns no fabricated records and exposes loading, empty, error, and unavailable states. Backend integration can replace that adapter without moving request logic into presentation components.

The frontend does not connect directly to Oracle, expose database credentials, or claim to persist form submissions. Real authentication, backend persistence, reports, notifications, document upload/storage, and other disabled future modules remain backend or later-phase work.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

The release audit also covers all implemented routes, all six sign-in flows, sign-out, cross-role redirects, disabled navigation, form validation, responsive layouts, and prohibited dummy/development wording in the interface.

## Repository structure

```text
PitchSync/
|-- src/                         # Next.js frontend
|-- backend/                     # Prepared Express backend boundary
|-- database/                    # Oracle migrations and supporting SQL
|-- docs/                        # Project proposal and documentation
|-- ER_Final.drawio.html         # Authoritative conceptual model
|-- Schema_Updated.png           # Authoritative relational schema
|-- PROJECT_SCOPE.md             # Frontend scope snapshot
|-- FRONTEND_COMPLETION.md       # Completion and verification handoff
`-- package.json
```

Database changes are outside the frontend task. Keep backend secrets only in ignored backend environment files, and never commit passwords, private keys, infrastructure addresses, or privileged Oracle credentials.

## License

This repository is maintained for academic and educational purposes.
