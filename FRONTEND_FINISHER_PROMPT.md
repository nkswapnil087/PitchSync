# PitchSync Frontend Finisher Agent — Master Execution Prompt

You are now the dedicated **PitchSync Frontend Finisher Agent** for the existing repository.

Your job is to inspect the current project, determine the real remaining frontend scope from the finalized product model, and finish the frontend comprehensively.

This is an execution task, not a planning-only task.

Use minimal narration and spend tokens primarily on inspecting, editing, testing, and fixing code.

---

## 1. Read project instructions first

Before editing anything:

1. Read the repository root `AGENTS.md`.
2. Inspect the existing frontend architecture and package configuration.
3. Inspect all files under `docs & assets/` that define the product, especially:
   - final ER diagram
   - finalized schema diagram
   - any Figma/PDF/UI references
   - project scope/readme files
4. Inspect existing route/navigation/module-status configuration.
5. Inspect all current frontend routes and major components.

Do not assume the old 60–70% milestone is still the completion target.

The new goal is to finish the frontend meaningfully and comprehensively.

---

## 2. Source-of-truth order

For frontend behavior and scope, follow this priority:

1. Final ER / finalized relational schema
2. Existing approved frontend product flow and roles
3. Existing working code
4. Approved visual direction
5. Figma/PDF references as visual inspiration only

If an old design conflicts with the final ER/schema or approved role model, do not follow the old design blindly.

Do not invent major business entities or workflows unsupported by the final model.

---

## 3. Final frontend goal

Finish all meaningful frontend modules implied by the finalized ER/schema and existing navigation.

Do not artificially limit the app to 22 pages if the final product model clearly requires more meaningful screens.

At the same time, do not create redundant pages only to inflate page count.

The finished frontend should be comprehensive enough that backend/API integration can be added later without needing to redesign the product shell.

---

## 4. Preserve the approved product identity

PitchSync must look Bangladesh-cricket inspired.

Use:
- deep Bangladesh green
- restrained Bangladesh red
- warm off-white / ivory Test-cricket neutrals
- dark green or green-black navigation
- professional institutional typography
- subtle cricket geometry where helpful

Do not use blue as the dominant product color.

Audit the entire codebase for old blue/sky/cyan/indigo primary states and replace inappropriate uses.

Red should be an accent, not an overwhelming background.

The UI must look like one coherent application across all roles.

---

## 5. Approved login flow

The login page must contain:
- email
- password
- role dropdown
- sign-in action

For the current frontend-only authentication:
- any syntactically valid email is accepted
- any non-empty password is accepted
- role is required
- never store the password
- do not create fake identities
- store only signed-in state and selected role in session storage

Approved roles only:
- Super Administrator
- Cricket Board Administrator
- Team Performance Manager
- Match Official
- Integrity & Compliance Officer
- Player

After sign-in, redirect directly to the matching dashboard.

There must be no separate role-selection page.

There must be no role switcher after login.

Cross-role dashboard access must redirect back to the active role dashboard.

Temporary auth must stay isolated for later backend replacement.

---

## 6. User-facing wording rules

Remove user-facing wording that exposes implementation incompleteness, including:

- demo
- demonstration
- dummy
- frontend-only
- backend unavailable
- backend integration pending
- temporary scaffolding
- academic project
- preview layout
- development mode

The interface should look like a real product.

When no records exist, use neutral language such as:
- No records found
- No activity recorded
- No matches available
- No cases found
- No information available

Use `—` for unknown metrics.

Do not falsely claim persistent saves or connected services.

---

## 7. No fabricated frontend dataset

Do not hardcode business records into the frontend.

Forbidden as source-code mock data:
- players
- teams
- matches
- tournaments
- complaints
- cases
- evidence
- reports
- users
- logs
- notifications
- metrics
- counts
- fake connected integrations

Do not copy Oracle seed/demo rows into frontend arrays.

Use proper empty/loading/error states.

Forms may keep user-entered data in component memory until refresh if backend persistence does not exist.

---

## 8. Audit current frontend before coding

Create an internal route/module inventory.

For every existing route classify it as:
- complete
- incomplete
- visually inconsistent
- broken
- redundant
- obsolete

Also inspect sidebar items that currently have no real page.

Compare the current frontend against:
- final ER/schema entities
- role responsibilities
- existing approved navigation

Identify the meaningful missing modules.

Do not stop at listing them.

Implement them.

---

## 9. Meaningful domain coverage

The final frontend should provide appropriate UI coverage for the real PitchSync domains represented in the final ER/schema, including where applicable:

### People / players
- player registry
- player profile
- registration/edit forms
- personal/contact information
- achievements
- career records
- team association
- role/playing information

### Teams
- team registry
- team details
- roster / player association
- relevant team competition information

### Tournaments
- tournament registry
- tournament details
- sponsors
- participating teams
- matches

### Matches
- match registry / fixtures
- match details
- teams
- officials where applicable
- batting/bowling/fielding summaries
- performance views
- results / status structure

### Performance / career
- batting
- bowling
- fielding
- player career overview
- performance summaries

### Integrity
- complaints
- integrity cases
- evidence
- involved persons
- investigations
- rulebook
- violations
- linked source/record views
- neutral confidentiality-friendly empty states

### Administration
- role-appropriate administrative registries/settings that are genuinely part of the existing product model

Do not create frontend modules for database join tables as standalone screens unless a real user workflow needs them.

Represent relationships in sensible details/tabs/forms instead.

---

## 10. Role-specific UX

Each role should see a coherent navigation set.

Do not show every possible module to every user.

Use centralized config for:
- role
- route access
- sidebar items
- labels
- icons
- module status

Dashboards should surface the most relevant modules for that role without fake metrics.

Use meaningful empty panels, shortcuts, and status structures.

---

## 11. Shared application shell

Maintain one shared application shell:
- sidebar
- top bar
- breadcrumbs
- page header
- content area
- consistent spacing/tokens

Do not build six unrelated applications.

Only role-specific navigation/content/accent details should vary.

Ensure desktop polish first, but keep layouts usable at common laptop/tablet widths.

---

## 12. Login design

Keep the login page premium and visually integrated.

Use:
- unified Bangladesh-green themed background
- subtle red accents
- warm translucent/glass login panel
- backdrop blur
- soft border
- warm off-white inputs
- abstract pitch/field/wicket geometry if already present or easy to preserve

Do not split the page into a disconnected blue/white layout.

Do not display internal technical notices.

---

## 13. Forms

All meaningful forms should have:
- React Hook Form
- Zod validation
- clear labels
- inline errors
- required markers
- validation summary when helpful
- proper select/date/textarea controls
- disabled/loading behavior
- clear cancel/reset/save/validate actions

Where no backend exists yet:
- do not fake persistence
- do not add new data to registries
- after successful validation, use truthful neutral wording
- retain values only in current component state if necessary

---

## 14. Tables and registries

Use consistent registry/table patterns:
- page header
- search
- relevant filters
- table
- pagination shell
- empty state
- actions

No fake rows.

Detail actions can route to structural detail pages using a neutral route parameter only where the existing routing model already supports it.

Do not invent fake IDs as visible records.

---

## 15. Detail pages

Entity detail pages should be structurally complete even without backend data.

Use:
- header
- status/badges
- detail grid
- tabs
- related-record sections
- empty states

Relationship-heavy join tables should generally be represented here instead of receiving pointless standalone CRUD pages.

---

## 16. Deferred navigation conversion

The old milestone kept many items disabled.

Now review each disabled item.

If it corresponds to a meaningful real frontend module supported by the final ER/schema, implement it and enable it.

Leave an item disabled only if:
- it is backend-only
- it has no meaningful frontend workflow
- it is outside the finalized product model
- it requires a backend capability that cannot be represented honestly in frontend-only form

Do not leave important product modules disabled just because they were deferred in the earlier milestone.

---

## 17. Backend-ready architecture

Still do NOT build the backend in this task.

However, prepare clean integration boundaries:
- typed domain interfaces
- repository/service contracts
- unavailable/empty adapter
- visual components receive typed props
- no future database-fetch code mixed directly into presentation components

Do not directly connect the browser to Oracle.

---

## 18. Cleanup

Delete obsolete code from earlier iterations, including where applicable:
- removed role-selection page
- unused demo-status components
- old backend status badges
- obsolete blue theme tokens
- unused preview wording/components
- dead route config
- stale duplicate components
- unnecessary development notices

Do not delete working code just for style preference.

---

## 19. Documentation and completion tracking

Update or create:
- `PROJECT_SCOPE.md`
- `FRONTEND_COMPLETION.md`

Track:
- implemented routes
- role access
- remaining intentionally non-frontend/backend-only items
- major UI architecture
- temporary auth boundary

Do not show completion percentages inside the product UI.

Documentation may state the truthful project status.

---

## 20. Mandatory verification

Before saying the frontend is finished:

1. Run lint.
2. Run TypeScript typecheck.
3. Run production build.
4. Fix all failures.
5. Verify all implemented routes render.
6. Verify every role can sign in.
7. Verify every role reaches the correct dashboard.
8. Verify cross-role dashboard protection.
9. Verify sign-out.
10. Verify sidebar navigation.
11. Verify intentionally disabled items truly do nothing.
12. Verify forms validate.
13. Verify no hardcoded fake business dataset exists.
14. Verify no user-facing demo/backend-development wording remains.
15. Verify no old blue-dominant theme remains.
16. Verify no obvious horizontal overflow on common desktop widths.
17. Verify design consistency across dashboards, registries, detail pages, forms, and integrity modules.

---

## 21. Token-efficient behavior

Use minimal but sufficient reasoning output.

Do not repeatedly summarize what you are about to do.

Do not ask for approval for routine frontend decisions.

Prefer:
inspect -> edit -> test -> fix -> continue

Ask the user only if you encounter a genuine ambiguity involving:
- final ER/schema meaning
- approved roles
- major workflow semantics
- a change that would alter database/business structure

---

## 22. Final response format

When the work is actually complete, report only:

1. Major frontend areas completed
2. Routes added/updated
3. Important obsolete routes/components removed
4. Auth/role behavior status
5. Remaining intentionally backend-only items
6. Lint result
7. Typecheck result
8. Production build result
9. Any genuine unresolved issue

Do not claim completion if lint/typecheck/build are still failing.

Start by reading `AGENTS.md`, auditing the repository, and then proceed with the implementation.



==================================================
GIT SAFETY / AUTO-COMMIT RULE
==================================================

I do not want to lose work.

From this point onward, make small checkpoint commits and pushes frequently.

Preferred cadence:
- after completing one small feature/page section
- after fixing a bug or build issue
- after a successful lint/typecheck/build checkpoint

For each checkpoint:

1. Review `git status`.
2. Stage only the relevant project files.
3. Create a concise descriptive commit message.
4. Push to the current remote branch.

Examples:
- `feat(frontend): finish team detail layout`
- `fix(nav): correct role route handling`
- `style(ui): apply Bangladesh cricket theme cleanup`
- `fix(build): resolve type errors in match module`

Important:
- Do not bundle huge unrelated changes into one commit.
- Do not commit secrets, passwords, `.env` credentials, wallets, generated caches, `node_modules`, or `.next`.
- Do not rewrite or squash existing history.
- Do not force-push.
- If push fails because the remote is ahead, STOP and report the exact Git state instead of force-pushing or rebasing automatically.
- If there are unrelated pre-existing user changes, preserve them and do not overwrite or discard them.
- Never use destructive commands like `git reset --hard` or `git clean -fd` without explicit approval.

Continue implementing after successful checkpoint pushes.

The goal is to keep the repository continuously backed up while the frontend finisher works.