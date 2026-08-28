<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
















PitchSync Agent Instructions

Project identity

PitchSync is a Bangladesh cricket administration, performance, competition, and integrity-management platform.

Source-of-truth order

When making frontend decisions, use this priority:

Final ER / finalized relational schema in docs & assets/

Existing working frontend routes/components and approved product flow

Approved Bangladesh-cricket visual direction

Figma/PDF references only as visual inspiration, not as a source of fake data or conflicting business rules

Do not invent entities, relationships, roles, or major workflows that conflict with the finalized data model.

Frontend completion goal

The current task is to finish the frontend comprehensively, not stop at the earlier 60–70% milestone.

Implement all meaningful frontend modules supported by the final ER/schema and the existing product/navigation structure.

Do not create pointless pages just to increase page count.

Visual direction

The product must feel Bangladesh-cricket inspired:

deep Bangladesh green as the primary brand color

restrained Bangladesh red accents

warm/off-white Test-cricket neutrals

dark green/navy-green text and sidebar tones

avoid blue-dominant styling

avoid visual resemblance to England-style cricket-board products

professional institutional UI, not a fan site

Use one coherent design system across all roles and pages.

Login and roles

Approved roles:

Super Administrator

Cricket Board Administrator

Team Performance Manager

Match Official

Integrity & Compliance Officer

Player

Role selection belongs inside the login form as a dropdown.

Current client-side auth may accept:

any valid-looking email

any non-empty password

one required role

One role is active per session.

After login, route directly to that role's dashboard.

Do not expose role switching after login.

Do not show demo/dummy/frontend-only/backend-not-connected/temporary-scaffolding wording in the user-facing interface.

Keep temporary authentication isolated so it can later be replaced by backend authentication.

Deferred/incomplete navigation

Until a page is implemented, its sidebar item may remain visible but must:

be disabled

have no working href

not navigate anywhere

not open a fake page

optionally show a subtle Coming soon tooltip

As the frontend-finishing task proceeds, convert meaningful deferred modules into real pages.

Data policy

Do not fabricate business records in frontend source code.

Do not seed hardcoded fake players, matches, cases, complaints, teams, stats, logs, notifications, or counts into the UI.

Use:

empty states

loading states

error states

unavailable/blank values

user-entered form values in component state only when backend persistence does not exist

Do not copy Oracle demo rows into frontend mock arrays.

Backend boundary

For the frontend-finishing task:

do not build the backend

do not connect directly to Oracle

do not expose DB credentials

do not install an ORM unless a later backend task explicitly requires it

keep data access behind typed interfaces/adapters so backend integration can replace the unavailable adapter later

Code quality

Use the existing stack and architecture unless there is a strong reason not to.

Preferred stack:

Next.js App Router

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide

React Hook Form

Zod

Framer Motion only where subtle motion helps

Requirements:

strict TypeScript

avoid any

reusable shared layout/components

centralized role/navigation/module config

no duplicated role strings throughout components

no giant page files when sections can be extracted cleanly

accessible labels, focus states, keyboard navigation, headings, disabled states

no fake success claims for unsaved data

Testing

Before declaring frontend work complete:

run lint

run typecheck

run production build

fix all errors

verify every implemented route renders

verify role guards

verify sign-in/sign-out flow

verify no cross-role dashboard access

verify disabled navigation does nothing

verify forms validate

verify no user-facing demo/backend-development wording remains

verify the application is not blue-dominant

verify no hardcoded fake business dataset was added

Change discipline

Prefer targeted edits over unnecessary rewrites.

Preserve working code.

If you discover a conflict that requires changing:

final ER/schema meaning

approved roles

major business workflow

database structure

stop and ask the user instead of improvising.

For normal frontend implementation details, proceed without repeatedly asking for approval.

Database logging

Any future Oracle database change must also be appended to:
docs & assets/query_history.txt

Do not overwrite previous SQL history and never log secrets
<!-- END:nextjs-agent-rules -->

