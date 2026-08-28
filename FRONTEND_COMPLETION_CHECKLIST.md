# PitchSync Frontend Completion Checklist

Use this as the agent's definition of done.

## A. Global
- [ ] Bangladesh green/red/off-white design system is consistent
- [ ] No blue-dominant legacy theme remains
- [ ] One shared app shell is used
- [ ] Typography, spacing, cards, tables, forms, tabs, badges are consistent
- [ ] No user-facing "demo/frontend/backend unavailable/temporary scaffolding" wording
- [ ] No hardcoded fake business dataset
- [ ] Neutral empty/loading/error states exist

## B. Authentication and roles
- [ ] Login has email, password, role dropdown
- [ ] Any valid-looking email + non-empty password works
- [ ] Role is required
- [ ] No separate role-selection page
- [ ] One role per session
- [ ] No post-login role switcher
- [ ] Direct redirect to selected-role dashboard
- [ ] Cross-role dashboard access is blocked/redirected
- [ ] Sign-out clears session
- [ ] Temporary auth is isolated for backend replacement

## C. Roles
- [ ] Super Administrator dashboard
- [ ] Cricket Board Administrator dashboard
- [ ] Team Performance Manager dashboard
- [ ] Match Official dashboard
- [ ] Integrity & Compliance Officer dashboard
- [ ] Player dashboard

## D. Player / person domain
- [ ] Player registry
- [ ] Player detail/profile
- [ ] Player create/register form
- [ ] Player edit-capable UI structure if appropriate
- [ ] Personal/contact section
- [ ] Playing information section
- [ ] Achievements section
- [ ] Career records section
- [ ] Team associations shown sensibly
- [ ] Batting/bowling/fielding career summaries represented

## E. Team domain
- [ ] Team registry
- [ ] Team detail page
- [ ] Roster/player association section
- [ ] Team competition/match relationship UI where meaningful

## F. Tournament domain
- [ ] Tournament registry
- [ ] Tournament detail page
- [ ] Sponsor section
- [ ] Participating teams section
- [ ] Tournament matches section

## G. Match domain
- [ ] Match registry / fixtures view
- [ ] Match detail page
- [ ] Teams section
- [ ] Officials/administrative section where supported
- [ ] Batting summary
- [ ] Bowling summary
- [ ] Fielding summary
- [ ] Performance sections
- [ ] Result/status structure
- [ ] Incident/related record section where supported

## H. Performance domain
- [ ] Player performance overview
- [ ] Batting performance view
- [ ] Bowling performance view
- [ ] Fielding performance view
- [ ] Career summary structure
- [ ] Filters/search where useful

## I. Integrity domain
- [ ] Complaint registry
- [ ] Complaint detail structure
- [ ] Integrity case registry or navigable case access
- [ ] Integrity case detail
- [ ] Evidence section
- [ ] Persons involved section
- [ ] Investigation section
- [ ] Rulebook registry/detail structure
- [ ] Violation/linked-rule structure
- [ ] Source/linked-record structure
- [ ] Confidentiality-conscious neutral empty states

## J. Administration
- [ ] Meaningful admin registries/settings represented
- [ ] Role-specific navigation is coherent
- [ ] Backend-only settings are not faked
- [ ] No fake audit/security/service status is shown

## K. Navigation
- [ ] Every implemented sidebar item navigates correctly
- [ ] Meaningful previously deferred modules are now implemented
- [ ] Truly unimplemented/backend-only items remain disabled
- [ ] Disabled items have no href and do nothing
- [ ] Breadcrumbs work
- [ ] No dead/broken routes
- [ ] No obsolete `/select-role` route

## L. Forms
- [ ] React Hook Form used where appropriate
- [ ] Zod validation used
- [ ] Inline errors
- [ ] Required markers
- [ ] Accessible labels
- [ ] No fake persistent-success messaging
- [ ] No localStorage business-data persistence

## M. Data states
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Unknown metric displayed as `—`
- [ ] No Oracle seed data copied into frontend code

## N. Accessibility / UX
- [ ] Keyboard navigation
- [ ] Visible focus styles
- [ ] Accessible form labels
- [ ] Correct heading hierarchy
- [ ] Buttons are buttons
- [ ] Links are links
- [ ] Disabled items use correct disabled semantics
- [ ] Reasonable contrast
- [ ] Reduced-motion respected

## O. Cleanup
- [ ] Old blue tokens removed/replaced
- [ ] Old role-selection components removed
- [ ] Backend-status/demo-banner components removed if obsolete
- [ ] Dead imports/code removed
- [ ] Duplicate components reduced
- [ ] No unnecessary giant page files

## P. Documentation
- [ ] `AGENTS.md` reflects approved rules
- [ ] `PROJECT_SCOPE.md` updated
- [ ] `FRONTEND_COMPLETION.md` updated
- [ ] Documentation separates frontend completion from future backend integration

## Q. Verification
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] All implemented routes render
- [ ] All six role flows tested
- [ ] Cross-role protection tested
- [ ] Sign-out tested
- [ ] No fake business records found in source
- [ ] No user-facing development disclosures found
- [ ] No blue-dominant visual regression found
