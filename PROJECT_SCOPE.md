# PitchSync Frontend Scope

The PitchSync frontend is complete for the product areas supported by the final ER, finalized relational schema, and approved role-based product flow.

## Completion snapshot

| Measure | Status |
| --- | --- |
| Product routes implemented | 25 |
| Role dashboards implemented | 6 of 6 |
| Core domain registries and details | Implemented |
| Responsive application shell | Implemented |
| Role guards and sign-out | Implemented |
| Fabricated business datasets | None |
| Backend persistence | Deferred |
| Real authentication | Deferred |

## Implemented product areas

- Role-aware sign-in and six dedicated dashboards
- Player registry, registration, profile, and edit views
- Team registry, details, roster, and match relationships
- Tournament registry, details, sponsors, participating teams, and matches
- Match registry and details with batting, bowling, and fielding performance sections
- Player performance registry and details with career summaries
- Complaint registry and details
- Integrity case registry and details with complaint source, involved players, assigned investigation team, violated rules, and evidence
- Rulebook registry and details

Relational tables are represented as useful sections inside entity pages rather than exposed as standalone database-table modules.

## Deliberately deferred

Real authentication and authorization, API persistence, Oracle connectivity, reports and exports, notifications, file storage, and other backend-dependent actions remain later-phase work. `USER_ACCOUNT`, `PLAYER_FITNESS`, and `AUDIT_LOG` are not treated as first-class frontend domains because they are absent from the authoritative ER/schema.

Deferred navigation is non-interactive and has no route. Route and module status is centralized in `src/config/module-status.ts`; access rules are centralized in `src/config/route-access.ts`.
