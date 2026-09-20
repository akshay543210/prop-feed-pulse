## Plan: Site Identity and Live Case Statistics

### What will change
- Use the uploaded Payout Cases image as the brand/profile image in the main navigation.
- Create a lightweight square favicon from the same image, preserving its proportions.
- Calculate homepage approval and denial totals directly from payout cases rather than stored firm counters.
- Subscribe the homepage to case changes so every displayed metric and ranking refreshes automatically.
- Subscribe the leaderboard to profile and case changes so contributor ranks and trust scores update automatically.

### Technical details
- Store the full uploaded image through the project asset flow and reference its generated asset pointer in the navigation.
- Generate a 64×64 padded favicon file in `public/` from the uploaded image.
- Reuse one homepage refresh function for initial loading and real-time case events, covering totals, case metrics, and monthly firm rankings.
- Reuse one leaderboard loader for initial loading and real-time events, with cleanup when leaving the page.
- Preserve the current dark visual system and existing ranking formulas.

### Verification
- Check the project build status.
- Open the homepage and leaderboard in the preview to confirm the image, favicon reference, totals, and rankings render without errors.
