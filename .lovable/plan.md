# Premium editorial-fintech redesign

## Goal
Restyle the existing Payout Cases application to follow the supplied black, warm-white, champagne, green, and red reference while preserving all routes, live data, authentication, submissions, voting, following, notifications, profiles, and admin behavior.

## Implementation
1. **Design system and shared shell**
   - Replace cyan/purple tokens, gradients, glow effects, typography, surfaces, borders, and motion with the specified warm editorial-fintech system.
   - Restyle shared buttons, cards, inputs, filters, badges, navigation, footer, page transitions, and responsive spacing.
   - Keep green and red restricted to approval and denial states.

2. **Homepage composition**
   - Rebuild the current hero around the existing message and actions with a light editorial layout, subtle market-chart texture, and a dark live-activity analytics panel driven by real payout cases.
   - Present live approval, denial, firm, case, payout-volume, verification, payout-time, and approval-rate metrics without fabricated values.
   - Restyle recent payout evidence, trusted firms, rankings, live feed, and analytics into alternating warm-white and black sections.

3. **Public data pages**
   - Restyle Firms, Firm Detail, Approvals, Denials, Leaderboard, Profile, and Notifications with premium headers, filters, tables/cards, charts, proof imagery, and responsive layouts.
   - Preserve sorting, voting, realtime refresh, follows, trust scoring, status filtering, and all existing links.
   - Add a reusable proof viewer so evidence opens clearly without changing storage or records.

4. **Account, submission, and admin screens**
   - Apply the same visual system to sign-in, the four-step case wizard, and admin pages.
   - Preserve validation, uploads, user linkage, role protection, redirects, and all management actions.

5. **Verification**
   - Check current diagnostics and compile status after changes.
   - Browser-test key public routes at desktop and mobile widths.
   - Exercise the authenticated submission/account flow where an available test session permits.

## Technical notes
- Reuse the current React components and data queries; no backend schema or business-logic changes are planned.
- Replace the decorative particle/blue globe treatment with CSS-driven financial texture and real-data panels.
- Use semantic theme tokens throughout; the supplied colors will live in the global design system rather than individual screens.
- Maintain the existing mobile navigation behavior and make horizontal evidence feeds intentionally swipeable.
