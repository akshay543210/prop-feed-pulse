# Payout Cases Brand Transformation

## Goal
Transform the public Payout Cases experience into a mature financial-intelligence platform built around the existing black-and-white logo. Preserve all current routes, database records, authentication, submissions, voting, follows, realtime updates, profiles, and admin workflows.

## Visual direction
- Obsidian navigation and data surfaces, soft-ivory editorial sections, metallic-gray borders, emerald approval/verified states, and restrained burgundy denial/disputed states.
- Use the existing logo unchanged in navigation and footer; keep its favicon.
- Replace cyan gradients, blue glow, particle-field styling, oversized rounded glass cards, and game-like 3D with fine borders, controlled shadows, subtle grain/grid texture, and restrained depth.
- Use Geist-style typography through the existing font delivery pattern, with tabular/monospace treatment for amounts, timestamps, and case IDs.
- Motion stays subtle: short fades, small vertical movement, restrained card tilt, smooth counters, and reduced-motion support.

## Build sequence

### 1. Foundation and shared shell
- Rework global semantic tokens and shared UI variants for the new palette, typography, radii, borders, shadows, and focus states.
- Create a consistent public-page shell so navigation, live-data status, transitions, and the editorial footer appear consistently without changing admin styling or route behavior.
- Redesign navigation around Approvals, Denials, Explore Firms, Payout Proofs, and Stats, while preserving account, notifications, mobile navigation, and the auth-aware Submit a Case action.
- Add compact-on-scroll behavior, a subtle live indicator, and polished mobile navigation.

### 2. Shared financial records and proof viewer
- Create reusable firm identity, verification stamp, case ID, payout record, live ticker, and empty/loading-state pieces.
- Add a fullscreen payout-proof viewer with image zoom, close, previous, and next controls plus a case-details side panel; make it full-screen and touch-friendly on mobile.
- Keep existing verification values intact and present them consistently: `verified` and `community_confirmed` as verified states, `pending` as reported, and `disputed` as disputed. Do not invent a rejected state for records that do not have one.
- Keep voting, submitter reputation, social proof links, and proof images functional inside the redesigned records.

### 3. Homepage
- Replace the current particle/globe hero with the requested editorial headline and a live Payout Intelligence terminal populated from actual recent cases.
- Add subtle cursor-responsive depth and restrained payout-card tilt without gaming-style motion.
- Add a live ticker and four realtime metrics: verified approvals, verified denials/reported denials, tracked eligible firms, and total payout volume.
- Restyle top-firm intelligence, monthly ranking, live activity, trust explanation, and footer into alternating obsidian and ivory editorial bands.
- Keep realtime subscriptions and smooth number/list updates; show a discreet new-payout notice instead of reloading the page.

### 4. Approvals, denials, and proofs
- Turn approvals and denials into dense, professional financial-record views with firm logo, amount, dates, trader identity, case ID, notes, proof preview, and explicit verification language.
- Give denials a restrained burgundy identity and wording that separates reported cases from verified evidence.
- Replace chip-only controls with a compact advanced filter bar for firm, verification, date, amount, and sorting while preserving table/card views and vote ordering.
- Add a public Payout Proofs view using the same records, limited to cases containing proof, with direct access to the fullscreen viewer.

### 5. Firms and firm intelligence
- Make Explore Firms show only firms with at least one verified or community-confirmed approval, deriving eligibility from existing case data rather than adding duplicate schema.
- Replace generic cards/table styling with Firm Intelligence Cards showing logo, website, verified payouts, reported denials, approval ratio, latest verified payout, and trend.
- Upgrade firm detail with a branded identity header, key intelligence metrics, minimal emerald/burgundy charts, Overview/Approvals/Denials/Proofs tabs, follow control, and an activity timeline.
- Preserve current calculations, realtime updates, links, filters, and follow behavior.

### 6. Supporting public screens
- Restyle Submit, Auth, Leaderboard, Profiles, Notifications, and Not Found to match the brand while preserving all behavior.
- Keep the four-step submission wizard, upload flow, auth gating, leaderboard formula, profile history, and followed-firm notifications unchanged.
- Correct misleading proof language in the interface: a supplied social link is treated according to current platform rules, without claiming manual review occurred.

### 7. Validation
- Verify desktop and mobile layouts for all public routes, including empty and populated states.
- Test navigation, filters, view switches, proof viewer controls, firm links, auth redirect, and signed-in submission flow where an available session permits it.
- Confirm realtime updates do not duplicate subscriptions or refresh whole pages.
- Check contrast, keyboard focus, reduced motion, image fallbacks, console/runtime errors, and the final build diagnostics.

## Technical notes
- Public frontend files and shared design tokens will change; existing database tables, policies, storage, generated integration files, admin routes, and business formulas remain intact.
- No new backend tables are needed for the redesign. Public firm eligibility is computed from existing verified approval cases.
- The current logo asset is preserved exactly; only its placement and surrounding presentation change.
- “Payout Proofs” becomes a dedicated public route. “Stats” links to the homepage statistics section so routing stays simple and stable.
- Existing metadata remains route-specific and will be updated only where new public page copy requires it.

## Acceptance criteria
- No cyan/blue-glow or generic glass-dashboard visual language remains on public pages.
- Every public case clearly communicates outcome and verification state without overstating unverified claims.
- Core user flows and current data remain functional and unchanged.
- The result feels cohesive across home, approvals, denials, proofs, firms, firm detail, leaderboard, profile, notifications, auth, and submission on desktop and mobile.
